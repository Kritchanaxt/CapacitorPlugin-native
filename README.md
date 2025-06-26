# คู่มือการสร้างแอป Native Capacitor Plugin (iOS & Android)

## ขั้นตอนที่ 1: การเตรียมเครื่องมือ (Prerequisites for macOS)

ก่อนเริ่มต้น ตรวจสอบให้แน่ใจว่าได้ติดตั้งเครื่องมือที่จำเป็นทั้งหมดแล้ว:
1.  **Homebrew:** (ถ้ายังไม่มี) `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
2.  **Node.js:** `brew install node`
3.  **Ionic CLI:** `npm install -g @ionic/cli`
4.  **Xcode:** ติดตั้งผ่าน Mac App Store และเปิดอย่างน้อยหนึ่งครั้งเพื่อยอมรับข้อตกลง
5.  **CocoaPods:** `sudo gem install cocoapods`
6.  **Android Studio:** ดาวน์โหลดและติดตั้งจาก [เว็บไซต์ของ Android Developer](https://developer.android.com/studio)

## ขั้นตอนที่ 2: การสร้างโปรเจคและติดตั้ง Plugin
1.  **สร้างโปรเจค Ionic React ใหม่:**
    ```bash
    ionic start my-ocr-app blank --type=react --capacitor
    ```
2.  **เข้าสู่โฟลเดอร์โปรเจค:**
    ```bash
    cd my-ocr-app
    ```
3.  **ติดตั้ง Plugin ที่จำเป็น:**
      * **OCR Plugin:** `npm install @capacitor-community/image-to-text`
      * **Camera Plugin:** `npm install @capacitor/camera`

## ขั้นตอนที่ 3: การพัฒนาโค้ดหลักของแอป
แทนที่เนื้อหาทั้งหมดในไฟล์ `src/pages/Home.tsx` ด้วยโค้ดด้านล่างนี้:

```tsx
import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  isPlatform
} from '@ionic/react';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Ocr, TextDetections } from '@capacitor-community/image-to-text';

const Home: React.FC = () => {
  const [detectedText, setDetectedText] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const scanImage = async () => {
    try {
      // ขอ Permission ก่อนเรียกใช้กล้อง
      if (isPlatform('hybrid')) {
        await Camera.requestPermissions();
      }

      // เปิดกล้อง
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (photo.path) {
        const result: TextDetections = await Ocr.detectText({
          filename: photo.path,
        });

        const detectedLines = result.textDetections.map(detection => detection.text);
        setDetectedText(detectedLines);
        setError('');

      }
    } catch (e: any) {
      console.error("OCR Error:", e);
      const errorMessage = e.message || "An error occurred while scanning.";
      if (errorMessage.toLowerCase().includes('cancelled')) {
        setError('User cancelled the action.');
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>OCR Scanner</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>สแกนตัวอักษรจากภาพ</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            กดปุ่มด้านล่างเพื่อเปิดกล้องและเริ่มสแกน
            <IonButton expand="block" onClick={scanImage} style={{ marginTop: '20px' }}>
              ถ่ายภาพและสแกน
            </IonButton>
          </IonCardContent>
        </IonCard>

        {error && <IonCard color="light"><IonCardContent style={{ color: 'red' }}>{error}</IonCardContent></IonCard>}

        {detectedText.length > 0 && (
          <IonCard style={{ marginTop: '20px' }}>
            <IonCardHeader>
              <IonCardTitle>ข้อความที่ตรวจพบ</IonTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {detectedText.map((text, index) => (
                  <IonItem key={index}>
                    <IonLabel text-wrap>{text}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
```

## ขั้นตอนที่ 4: การตั้งค่าฝั่ง iOS

1.  **ติดตั้งและเพิ่มแพลตฟอร์ม iOS:**

    ```bash
    npm install @capacitor/ios
    npm run build
    npx cap add ios
    ```

2.  **ตั้งค่า Permissions ใน `Info.plist`:**

      * เปิดโปรเจคใน Xcode: `npx cap open ios`
      * ไปที่ `App` -\> `Info.plist` และเพิ่ม 3 Keys ต่อไปนี้:
          * `Privacy - Camera Usage Description` | เหตุผล: `แอปต้องการใช้กล้องเพื่อถ่ายภาพและสแกนตัวอักษร`
          * `Privacy - Photo Library Usage Description` | เหตุผล: `แอปต้องการเข้าถึงคลังภาพเพื่อเลือกรูปมาสแกน`
          * `Privacy - Photo Library Additions Usage Description` | เหตุผล: `แอปต้องการสิทธิ์ในการบันทึกรูปภาพลงในคลังภาพ`

3.  **Build และ Run:**

      * ใน Xcode, เลือก Simulator หรืออุปกรณ์จริง แล้วกดปุ่ม ▶️ Run

## ขั้นตอนที่ 5: การตั้งค่าฝั่ง Android

1.  **ตั้งค่า Firebase:**

      * ไปที่ [Firebase Console](https://console.firebase.google.com/) สร้างโปรเจคใหม่ (หรือใช้โปรเจคเดิม)
      * **Add app** และเลือก **Android**.
      * ใส่ **Package Name** เป็น: `io.ionic.starter`
      * กด **Register app** และดาวน์โหลดไฟล์ **`google-services.json`**
      * นำไฟล์ `google-services.json` ที่ดาวน์โหลดมา ไปวางไว้ในโฟลเดอร์ **`android/app/`** ของโปรเจค

2.  **ติดตั้งและเพิ่มแพลตฟอร์ม Android:**

    ```bash
    npm install @capacitor/android
    npm run build
    npx cap add android
    ```

3.  **ตั้งค่า Permissions ใน `AndroidManifest.xml`:**

      * เปิดโปรเจคใน Android Studio: `npx cap open android`
      * เปิดไฟล์ `android/app/src/main/AndroidManifest.xml`
      * เพิ่มโค้ดด้านล่างนี้เข้าไป *ก่อน* tag `<application>`:
        ```xml
        <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
        <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
        <uses-permission android:name="android.permission.CAMERA" />
        ```

4.  **Build และ Run:**

      * ใน Android Studio, รอให้ Gradle Sync เสร็จสิ้น
      * เลือก Emulator หรืออุปกรณ์จริง แล้วกดปุ่ม ▶️ Run

## ขั้นตอนที่ 6: Workflow การทำงานปกติ

เมื่อต้องการแก้ไขหรือพัฒนาแอปเพิ่มเติม ให้ทำตามลำดับนี้:

1.  แก้ไขโค้ดใน `src/`
2.  `npm run build`
3.  `npx cap sync`
4.  `npx cap open ios` หรือ `npx cap open android`
5.  Run โปรเจคจาก Xcode หรือ Android Studio

-----
