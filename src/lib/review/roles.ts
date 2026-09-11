import {
  type ClaimId,
  type ReviewMode,
  type RoleName,
  type RoleOutput,
  parseRoleOutput,
} from "./contracts";
import type { ReviewModelProvider } from "./provider";

export interface ExecuteRoleOptions {
  claimId: ClaimId;
  mode: ReviewMode;
  role: RoleName;
  provider: ReviewModelProvider;
  signal?: AbortSignal;
}

export async function executeRole(options: ExecuteRoleOptions): Promise<RoleOutput> {
  const { claimId, mode, role, provider, signal } = options;

  if (signal?.aborted) {
    throw signal.reason || new DOMException("Aborted", "AbortError");
  }

  const rawOutput = await provider.executeRole({
    claimId,
    mode,
    role,
    signal,
  });

  return parseRoleOutput(rawOutput, `$roleOutput.${role}`);
}

export interface ExecuteAllRolesOptions {
  claimId: ClaimId;
  mode: ReviewMode;
  provider: ReviewModelProvider;
  signal?: AbortSignal;
}

export async function executeAllRolesInParallel(
  options: ExecuteAllRolesOptions,
): Promise<RoleOutput[]> {
  const roles: RoleName[] = ["researcher", "skeptic", "verifier"];

  const promises = roles.map((role) =>
    executeRole({
      claimId: options.claimId,
      mode: options.mode,
      role,
      provider: options.provider,
      signal: options.signal,
    }),
  );

  return Promise.all(promises);
}
