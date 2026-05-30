---
title: "Local LLM Limitlerine Son: 9Router ve Hermes Agent ile Kendi Sınırsız Yapay Zeka Asistanınızı Kurun"
date: "2026-05-30"
tags: ["AI", "Hermes Agent", "9Router", "LLM", "Open Source", "Tutorial"]
description: "Ücretsiz API anahtarlarınızı tek bir havuzda toplayıp limitlere takılmadan, doğrudan Telegram veya terminal üzerinden kullanabileceğiniz kendi asistanınızı nasıl kuracağınızı anlatıyorum."
---

# Local LLM Limitlerine Son: 9Router ve Hermes Agent ile Kendi Sınırsız Yapay Zeka Asistanınızı Kurun

Yapay zeka araçlarını günlük iş akışımıza entegre ederken en sık karşılaştığımız sorun genelde API limitleri oluyor. Bulut modellerini (Claude, GPT-4, Gemini) ücretsiz kullanmak istediğinizde sürekli rate limit duvarına çarpıyorsunuz.

İşte tam bu noktada harika bir açık kaynak ikilisi devreye giriyor: **9Router** ve **Hermes Agent**.

Bu yazıda, ücretsiz API anahtarlarınızı tek bir havuzda toplayıp limitlere takılmadan, doğrudan Telegram veya terminal üzerinden kullanabileceğiniz kendi asistanınızı nasıl kuracağınızı anlatacağım.

## 9Router Nedir?

9Router, açık kaynaklı bir API Gateway (Ağ Geçidi) yazılımı. Çözdüğü sorun aslında çok basit:

Diyelim ki elinizde Google Gemini, OpenRouter, Groq ve diğer ücretsiz API anahtarları var. 9Router bu anahtarları alıyor ve tek bir uç nokta (endpoint) arkasında birleştiriyor. 

- Bir API anahtarınızın limiti dolduğunda veya hata verdiğinde, sistem otomatik olarak sıradaki anahtara geçiyor (cascade mantığı).
- Gelen istekleri farklı API anahtarları arasında dağıtarak yük dengelemesi yapıyor.

Sonuç olarak, siz modelin limitinin dolup dolmadığını düşünmek zorunda kalmıyorsunuz. Arkada her zaman çalışan, kesintisiz bir API havuzunuz oluyor.

## Hermes Agent Nedir?

Hermes Agent, Nous Research tarafından geliştirilmiş, terminalinizde veya Telegram/Discord gibi mesajlaşma uygulamalarında çalışan açık kaynaklı bir "Agentic AI" (Ajan Yapay Zeka) aracı.

Sıradan bir sohbet botu değil; bilgisayarınızda gerçekten işlemler yapabiliyor. Sizin adınıza terminalde komut çalıştırıyor, dosya okuyup yazıyor, web'de araştırma yapıyor ve kod yazıyor. En büyük avantajı, platform bağımsız olması — bilgisayar başında olmasanız bile yoldayken Telegram'dan ona iş yaptırabiliyorsunuz.

## Kurulum ve Yapılandırma Rehberi

Bu iki aracı birleştirerek asistanımızı kuruyoruz.

### Adım 1: Hermes Agent Kurulumu

Terminalinizi (Linux/macOS) veya Git Bash/WSL'i (Windows) açın ve şu komutu çalıştırın:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

Kurulum bitince terminale `hermes` yazarak çalışıp çalışmadığını test edebilirsiniz.

### Adım 2: 9Router Ayarları ve API'leri Bağlama

Öncelikle 9Router projesini yapılandırmanız veya OpenRouter gibi ücretsiz krediler veren bir havuz sağlayıcı kullanmanız gerekiyor.

Eğer kendi 9Router API adresinizi kullanacaksanız, Hermes Agent'a bunu öğretmeniz lazım. Terminalde şu komutları çalıştırıyoruz:

```bash
# Custom API endpoint'ini ayarlayın (Örn: 9router adresiniz)
hermes config set model.base_url "https://api.9router.com/v1"

# 9Router'dan aldığınız Master API key'i girin
hermes config set model.api_key "sk-sizin-anahtariniz"

# Provider olarak custom seçin
hermes config set model.provider "custom"

# Varsayılan modeli belirleyin
hermes config set model.default "anthropic/claude-3-sonnet"
```

*Not: Eğer sadece OpenRouter kullanacaksanız, doğrudan terminalde `hermes model` yazıp açılan menüden OpenRouter'ı seçip API anahtarınızı girmeniz yeterli.*

### Adım 3: Telegram Entegrasyonu

Hermes Agent'ı sadece bilgisayar başında değil, dışarıdayken telefonunuzdan Telegram üzerinden de kullanabiliyorsunuz.

1. Telegram'da **@BotFather**'a gidip yeni bir bot oluşturun ve `HTTP API Token` alın.
2. Terminalinizde şu komutu çalıştırın:
   ```bash
   hermes gateway setup
   ```
3. Menüden **Telegram**'ı seçin ve BotFather'dan aldığınız token'ı yapıştırın.
4. Telegram'a girip kendi botunuza `/start` yazın. Hermes terminalde bir eşleşme (pairing) isteği gösterecek, bunu onaylayın.
5. Son olarak Gateway'i arkaplanda çalışması için başlatın:
   ```bash
   hermes gateway install
   hermes gateway start
   ```

Bitti. Artık Telegram'dan mesaj attığınızda evdeki bilgisayarınızda çalışan, 9Router sayesinde API limitlerine takılmayan, gerektiğinde web'de arama yapan veya bilgisayarınızda kod çalıştıran bir asistanınız var.

---

**Siz de bu sistemi kurarken bir sorun yaşarsanız yorumlarda veya LinkedIn üzerinden bana ulaşabilirsiniz.**