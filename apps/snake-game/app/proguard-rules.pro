# Keep JavaScript interface members if added later.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
