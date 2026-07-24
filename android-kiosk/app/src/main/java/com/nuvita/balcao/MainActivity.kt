package com.nuvita.balcao

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    companion object {
        // ════════════════════════════════════════════════════════════
        //  ⚠️  TROQUE pela URL do balcão em produção (o seu domínio):
        //  Ex.: "https://nuvita.vercel.app/farmacia"
        //       ou o domínio próprio, ex.: "https://balcao.nuvita.com.br/farmacia"
        // ════════════════════════════════════════════════════════════
        const val KIOSK_URL = "https://nuvita.vercel.app/farmacia"

        // Nº de toques no canto superior esquerdo para SAIR do quiosque (manutenção).
        private const val MAINT_TAPS = 7
        private const val MAINT_WINDOW_MS = 3000L
    }

    private lateinit var webView: WebView
    private lateinit var dpm: DevicePolicyManager
    private lateinit var adminComponent: ComponentName

    private var tapCount = 0
    private var firstTapAt = 0L
    private var maintenanceUnlocked = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        adminComponent = ComponentName(this, KioskDeviceAdminReceiver::class.java)

        configurarComoDeviceOwner()

        val root = FrameLayout(this)

        webView = WebView(this)
        root.addView(
            webView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
            ),
        )

        // Alvo invisível de manutenção no canto superior esquerdo.
        val corner = View(this).apply {
            setOnClickListener { registrarToqueManutencao() }
        }
        val cornerSize = dp(64)
        root.addView(
            corner,
            FrameLayout.LayoutParams(cornerSize, cornerSize, Gravity.TOP or Gravity.START),
        )

        setContentView(root)
        configurarWebView()
        webView.loadUrl(KIOSK_URL)
    }

    /** Se formos Device Owner, autoriza Lock Task e vira a "home" do tablet. */
    private fun configurarComoDeviceOwner() {
        if (!dpm.isDeviceOwnerApp(packageName)) return

        // 1) Autoriza este pacote a entrar em Lock Task Mode.
        dpm.setLockTaskPackages(adminComponent, arrayOf(packageName))

        // 2) Torna o app a tela inicial persistente (botão Home volta pra cá).
        val homeFilter = IntentFilter(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            addCategory(Intent.CATEGORY_DEFAULT)
        }
        dpm.addPersistentPreferredActivity(
            adminComponent,
            homeFilter,
            ComponentName(packageName, MainActivity::class.java.name),
        )

        // 3) (Opcional) restrições extras de quiosque. Descomente conforme a política:
        // dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_FACTORY_RESET)
        // dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_INSTALL_APPS)
        // dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_SAFE_BOOT)
        // dpm.setStatusBarDisabled(adminComponent, true)
    }

    private fun configurarWebView() {
        val s: WebSettings = webView.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true          // necessário p/ o gate de PIN (sessionStorage)
        s.databaseEnabled = true
        s.cacheMode = WebSettings.LOAD_DEFAULT
        s.mediaPlaybackRequiresUserGesture = false
        s.useWideViewPort = true
        s.loadWithOverviewMode = true
        s.setSupportZoom(false)
        s.builtInZoomControls = false

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            // Mantém a navegação DENTRO do WebView — nunca abre o Chrome externo.
            override fun shouldOverrideUrlLoading(view: WebView?, req: WebResourceRequest?): Boolean {
                val url = req?.url?.toString() ?: return false
                // wa.me / whatsapp abrem o app do WhatsApp (Intent), o resto segue no WebView.
                if (url.startsWith("https://wa.me") || url.startsWith("whatsapp:") ||
                    url.startsWith("tel:") || url.startsWith("mailto:")
                ) {
                    return try {
                        startActivity(Intent(Intent.ACTION_VIEW, req.url))
                        true
                    } catch (_: Exception) {
                        false
                    }
                }
                return false
            }
        }
    }

    override fun onResume() {
        super.onResume()
        habilitarImmersive()
        iniciarQuiosque()
    }

    private fun iniciarQuiosque() {
        if (maintenanceUnlocked) return
        if (dpm.isDeviceOwnerApp(packageName)) {
            try {
                startLockTask()   // Lock Task Mode nativo — o bloqueio mais forte do Android.
            } catch (_: Exception) { /* já em lock task */ }
        }
    }

    private fun habilitarImmersive() {
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            )
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) habilitarImmersive()
    }

    // Botão voltar: navega no histórico do site; nunca sai do app.
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack()
        // senão: ignora — fica preso no balcão.
    }

    /**
     * Gesto de manutenção: 7 toques no canto superior esquerdo em até 3s
     * saem do Lock Task (para o técnico usar o tablet). Só funciona no aparelho físico.
     */
    private fun registrarToqueManutencao() {
        val agora = System.currentTimeMillis()
        if (agora - firstTapAt > MAINT_WINDOW_MS) {
            firstTapAt = agora
            tapCount = 0
        }
        tapCount++
        if (tapCount >= MAINT_TAPS) {
            tapCount = 0
            maintenanceUnlocked = true
            try {
                stopLockTask()
            } catch (_: Exception) { }
            Toast.makeText(this, "Modo manutenção ativado", Toast.LENGTH_LONG).show()
        }
    }

    private fun dp(v: Int): Int = TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics,
    ).toInt()
}
