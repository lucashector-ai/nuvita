# Mantém a interface JS do WebView, se um dia for usada.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
