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

  const checkPermissions = async () => {
    if (isPlatform('hybrid')) { 
      await Camera.requestPermissions();
    }
  };

  const scanImage = async () => {
    try {
      
      await checkPermissions();

      
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
      console.error("เกิดข้อผิดพลาดระหว่างการสแกน:", e);
      const errorMessage = e.message || "ไม่สามารถสแกนภาพได้";
     
      if (errorMessage.includes('cancelled')) {
        setError('คุณได้ยกเลิกการถ่ายภาพ');
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

        {/* แสดงผลลัพธ์ */}
        {error && <IonCard color="light"><IonCardContent style={{ color: 'red' }}>{error}</IonCardContent></IonCard>}

        {detectedText.length > 0 && (
          <IonCard style={{ marginTop: '20px' }}>
            <IonCardHeader>
              <IonCardTitle>ข้อความที่ตรวจพบ</IonCardTitle>
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