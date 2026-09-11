import {
  type ReviewEvent,
  REVIEW_EVENT_TYPES,
  parseReviewEvent,
} from "./contracts";

export class EventSequenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventSequenceError";
  }
}

export class EventOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventOrderError";
  }
}

export function formatSseEvent(event: ReviewEvent): string {
  if (!REVIEW_EVENT_TYPES.includes(event.type)) {
    throw new EventOrderError(`Unknown or invalid review event type: "${event.type}"`);
  }
  const safeType = String(event.type).replace(/[\r\n]/g, "");
  const safeSequence = String(event.sequence).replace(/[\r\n]/g, "");
  return `id: ${safeSequence}\nevent: ${safeType}\ndata: ${JSON.stringify(event)}\n\n`;
}

export function formatSseComment(comment: string = "keep-alive"): string {
  const sanitized = comment.replace(/[\r\n]/g, " ");
  return `: ${sanitized}\n\n`;
}

export function createKeepAliveComment(): string {
  return formatSseComment("keep-alive");
}

type SerializerState = "initial" | "running" | "verdict" | "receipt" | "terminated";

export class ReviewEventSerializer {
  private sequence = 0;
  private currentRunId: string | null = null;
  private state: SerializerState = "initial";

  public get currentSequence(): number {
    return this.sequence;
  }

  public get runId(): string | null {
    return this.currentRunId;
  }

  public get isTerminated(): boolean {
    return this.state === "terminated";
  }

  public validateNext(event: ReviewEvent): void {
    // 1. Structural validity via contracts parse
    parseReviewEvent(event);

    // 2. Terminal guard
    if (this.state === "terminated") {
      throw new EventOrderError(
        `Cannot emit event "${event.type}" after review execution has terminated`,
      );
    }

    // 3. Monotonic sequence validation (must start at 1, increment by 1)
    if (this.sequence === 0) {
      if (event.sequence !== 1) {
        throw new EventSequenceError(
          `Initial event sequence must be 1, but received ${event.sequence}`,
        );
      }
    } else {
      if (event.sequence !== this.sequence + 1) {
        throw new EventSequenceError(
          `Non-monotonic event sequence: expected ${this.sequence + 1}, but received ${event.sequence}`,
        );
      }
    }

    // 4. Validate run ID consistency if already established
    if (this.currentRunId && this.currentRunId !== event.runId) {
      throw new EventOrderError(
        `Run ID mismatch: expected "${this.currentRunId}", but received "${event.runId}"`,
      );
    }

    // 5. Validate event ordering state machine
    let nextState: SerializerState = this.state;
    switch (this.state) {
      case "initial": {
        if (event.type === "run.started") {
          nextState = "running";
        } else if (event.type === "run.error") {
          nextState = "terminated";
        } else {
          throw new EventOrderError(
            `First event must be run.started (or terminal run.error), but received "${event.type}"`,
          );
        }
        break;
      }
      case "running": {
        if (event.type === "run.started") {
          throw new EventOrderError("Duplicate run.started event");
        } else if (event.type === "run.receipt") {
          throw new EventOrderError("run.receipt cannot be emitted before run.verdict");
        } else if (event.type === "run.completed") {
          throw new EventOrderError("run.completed cannot be emitted before run.receipt");
        } else if (event.type === "run.verdict") {
          nextState = "verdict";
        } else if (event.type === "run.error") {
          nextState = "terminated";
        }
        break;
      }
      case "verdict": {
        if (event.type === "run.receipt") {
          nextState = "receipt";
        } else if (event.type === "run.error") {
          nextState = "terminated";
        } else {
          throw new EventOrderError(
            `Expected run.receipt after run.verdict, but received "${event.type}"`,
          );
        }
        break;
      }
      case "receipt": {
        if (event.type === "run.completed") {
          nextState = "terminated";
        } else if (event.type === "run.error") {
          nextState = "terminated";
        } else {
          throw new EventOrderError(
            `Expected run.completed after run.receipt, but received "${event.type}"`,
          );
        }
        break;
      }
    }

    // Only update state and sequence once all validations pass
    this.state = nextState;
    this.currentRunId = event.runId;
    this.sequence = event.sequence;
  }

  public serialize(event: ReviewEvent): string {
    this.validateNext(event);
    return formatSseEvent(event);
  }
}

export function validateEventSequence(events: readonly ReviewEvent[]): void {
  if (events.length === 0) {
    throw new EventOrderError("Event sequence cannot be empty");
  }

  const serializer = new ReviewEventSerializer();
  for (const ev of events) {
    serializer.validateNext(ev);
  }

  if (!serializer.isTerminated) {
    throw new EventOrderError(
      "Event sequence ended prematurely without a terminal event (run.completed or run.error)",
    );
  }
}
