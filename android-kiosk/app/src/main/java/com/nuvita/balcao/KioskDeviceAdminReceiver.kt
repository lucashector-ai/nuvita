package com.nuvita.balcao

import android.app.admin.DeviceAdminReceiver

/**
 * Receiver de administração do dispositivo.
 * A existência dele (declarada no Manifest) é o que permite tornar o app
 * Device Owner via:
 *
 *   adb shell dpm set-device-owner com.nuvita.balcao/.KioskDeviceAdminReceiver
 */
class KioskDeviceAdminReceiver : DeviceAdminReceiver()
