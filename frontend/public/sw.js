// 복약 관리 서비스 워커
const CACHE_NAME = 'medication-app-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 네트워크 요청 처리
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에서 찾으면 반환, 없으면 네트워크 요청
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// 푸시 알림 수신
self.addEventListener('push', (event) => {
  console.log('푸시 메시지 수신:', event);

  let notificationData = {
    title: '복약 알림',
    body: '복용할 약물이 있습니다.',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'medication-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'take',
        title: '복용 완료',
        icon: '/check-icon.png'
      },
      {
        action: 'snooze',
        title: '10분 후 알림',
        icon: '/snooze-icon.png'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('푸시 데이터 파싱 오류:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭:', event);

  event.notification.close();

  if (event.action === 'take') {
    // 복용 완료 처리
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          // 앱이 열려있으면 메시지 전송
          clientList[0].postMessage({
            type: 'MEDICATION_TAKEN',
            data: event.notification.data
          });
          return clientList[0].focus();
        } else {
          // 앱이 닫혀있으면 열기
          return clients.openWindow('/medication');
        }
      })
    );
  } else if (event.action === 'snooze') {
    // 10분 후 다시 알림
    setTimeout(() => {
      self.registration.showNotification(event.notification.title, {
        ...event.notification,
        body: event.notification.body + ' (재알림)',
        tag: event.notification.tag + '-snooze'
      });
    }, 10 * 60 * 1000); // 10분
  } else {
    // 기본 클릭 - 앱 열기
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        } else {
          return clients.openWindow('/medication');
        }
      })
    );
  }
});

// 알림 닫기 처리
self.addEventListener('notificationclose', (event) => {
  console.log('알림 닫힘:', event);
  
  // 알림이 닫혔을 때의 분석 데이터 수집 등
  // analytics.track('notification_dismissed', {
  //   tag: event.notification.tag,
  //   timestamp: Date.now()
  // });
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'medication-sync') {
    event.waitUntil(
      // 복약 데이터 동기화 로직
      syncMedicationData()
    );
  }
});

// 복약 데이터 동기화 함수
async function syncMedicationData() {
  try {
    // 오프라인에서 저장된 복약 기록을 서버로 전송
    const offlineRecords = await getOfflineMedicationRecords();
    
    for (const record of offlineRecords) {
      await fetch('/api/medications/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });
    }
    
    // 동기화 완료 후 오프라인 데이터 삭제
    await clearOfflineMedicationRecords();
  } catch (error) {
    console.error('복약 데이터 동기화 실패:', error);
  }
}

// 오프라인 복약 기록 조회 (IndexedDB 사용)
async function getOfflineMedicationRecords() {
  // IndexedDB에서 오프라인 기록 조회
  return [];
}

// 오프라인 복약 기록 삭제
async function clearOfflineMedicationRecords() {
  // IndexedDB에서 동기화된 기록 삭제
}

// 정기적인 알림 체크 (백그라운드에서)
setInterval(() => {
  checkScheduledNotifications();
}, 60000); // 1분마다

async function checkScheduledNotifications() {
  try {
    // 서버에서 예정된 알림 확인
    const response = await fetch('/api/notifications/pending');
    const notifications = await response.json();
    
    const now = new Date();
    
    for (const notification of notifications) {
      const scheduledTime = new Date(notification.scheduledFor);
      
      if (scheduledTime <= now && !notification.sentAt) {
        // 알림 표시
        await self.registration.showNotification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png',
          tag: notification.id,
          data: notification
        });
      }
    }
  } catch (error) {
    console.error('예정된 알림 확인 실패:', error);
  }
}