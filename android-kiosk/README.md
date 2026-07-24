# Nuvita Balcão — APK Quiosque (Device Owner + Lock Task)

App Android nativo que abre **direto** o balcão da Nuvita (`/farmacia`) em tela cheia
e transforma o tablet num **quiosque travado**: sem barra de status, sem botão home,
sem recentes, sem notificações — bloqueio no nível do sistema (Lock Task Mode nativo),
não por gambiarra de overlay.

É um WebView (funciona com qualquer URL, inclusive domínio próprio) + `DeviceAdminReceiver`
para virar **Device Owner** via ADB, **sem MDM e sem custo**.

---

## 0. Pré-requisitos

- **Android Studio** (Giraffe ou mais novo) — jeito mais fácil de compilar.
- **ADB** (vem no Android Studio, em `platform-tools`).
- Um **tablet Android 8.0+ (API 26+)** que possa ser **resetado de fábrica**.

---

## 1. Configurar a URL do balcão

Abra **`app/src/main/java/com/nuvita/balcao/MainActivity.kt`** e troque a constante:

```kotlin
const val KIOSK_URL = "https://nuvita.vercel.app/farmacia"
```

Coloque o domínio real de produção (ex.: `https://balcao.nuvita.com.br/farmacia`).
> O PIN da tela do balcão continua valendo — ele roda dentro do WebView normalmente.

---

## 2. Gerar o APK

### Opção A — Android Studio (recomendado)
1. `File → Open` → selecione a pasta **`android-kiosk`**.
2. Espere o Gradle sincronizar (ele baixa o wrapper e as dependências).
3. `Build → Build Bundle(s) / APK(s) → Build APK(s)`.
4. O APK sai em `app/build/outputs/apk/debug/app-debug.apk`.

### Opção B — linha de comando
```bash
cd android-kiosk
# se ainda não houver o gradlew nesta máquina:
gradle wrapper
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

> Para produção de verdade, gere um APK **assinado** (`Build → Generate Signed Bundle / APK`)
> e guarde o keystore. Para o quiosque interno, o `app-debug.apk` já funciona.

---

## 3. Preparar o tablet

O `set-device-owner` **só funciona em tablet recém-resetado e sem nenhuma conta Google/Samsung adicionada**.

1. **Ajustes → Sistema → Restaurar padrão de fábrica** (apaga tudo).
2. Na configuração inicial, **NÃO adicione conta Google** nem crie/adote perfis.
   - Conecte só no Wi-Fi. Pule tudo que puder.
3. Ative o **Modo desenvolvedor**: `Ajustes → Sobre o tablet` → toque 7x em "Número da versão".
4. `Ajustes → Sistema → Opções do desenvolvedor` → ligue **Depuração USB**.
5. Ligue o tablet no computador por USB e autorize a depuração quando pedir.

---

## 4. Instalar e tornar Device Owner

```bash
# 1) instala o APK
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 2) torna o app Device Owner (ativa o quiosque nativo)
adb shell dpm set-device-owner com.nuvita.balcao/.KioskDeviceAdminReceiver
```

Se der certo, aparece algo como:
```
Success: Device owner set to package com.nuvita.balcao
```

Erros comuns:
- `Not allowed to set the device owner because there are already some accounts on the device`
  → ainda há conta no tablet. Volte ao passo 3 (reset + não logar em conta nenhuma).
- `already ... a device owner` → já está configurado.

Abra o app: ele entra em **Lock Task Mode** sozinho e fica preso no balcão. 🎉

---

## 5. O que o quiosque trava (de brinde)

Com Device Owner + Lock Task ativos, você tem:
- ✅ Barra de status, botão home, recentes e notificações **mortos no nível do sistema**.
- ✅ O app vira a "tela inicial" (Home) — o botão home volta pra ele.
- ✅ Navegação presa dentro do balcão (o botão voltar só anda no histórico do site).
- ✅ WhatsApp (`wa.me`) abre o app do WhatsApp e volta pro balcão.

Restrições extras opcionais já deixei prontas (comentadas) em `MainActivity.configurarComoDeviceOwner()`:
bloquear factory reset, bloquear instalação de apps, bloquear safe boot, esconder a status bar.
Descomente conforme sua política.

---

## 6. Sair do quiosque (manutenção)

Dois jeitos:

- **Gesto**: toque **7x no canto superior esquerdo** da tela em até 3 segundos → sai do
  Lock Task ("Modo manutenção ativado"). Reabrir o app volta a travar.
- **ADB** (com o tablet ligado no PC):
  ```bash
  adb shell am force-stop com.nuvita.balcao
  ```

---

## 7. Atualizar o app depois

- **Mudou só o site** (o que roda em `/farmacia`)? Não precisa mexer no APK — é web,
  atualiza sozinho no próximo carregamento.
- **Mudou o app nativo/URL**? Recompile e:
  ```bash
  adb install -r app/build/outputs/apk/debug/app-debug.apk
  ```

---

## 8. Remover o Device Owner (desativar o quiosque de vez)

```bash
adb shell dpm remove-active-admin com.nuvita.balcao/.KioskDeviceAdminReceiver
```
Se estiver travado e o comando não passar, o caminho garantido é **restaurar de fábrica**.

---

## Alternativa: TWA (PWABuilder / Bubblewrap)
Em vez do WebView, dá para empacotar como **TWA** (roda sobre o Chrome, visual idêntico ao site).
Requer HTTPS + publicar um `assetlinks.json` em `https://SEU-DOMINIO/.well-known/assetlinks.json`
com o fingerprint SHA-256 da chave de assinatura. O Device Owner + Lock Task (passos 3–6) são
os mesmos. Fica como opção; o WebView acima é mais simples de controlar e funciona com qualquer URL.

---

## Estrutura
```
android-kiosk/
├── settings.gradle.kts / build.gradle.kts / gradle.properties
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/nuvita/balcao/
│       │   ├── MainActivity.kt              ← WebView + Lock Task + immersive
│       │   └── KioskDeviceAdminReceiver.kt  ← habilita Device Owner
│       └── res/                             ← ícone, tema, política de admin
```
