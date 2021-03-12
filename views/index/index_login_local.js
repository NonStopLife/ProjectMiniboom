var appServerPublicKey;
var isSubscribed; //구독정보는 누가 가지고 있는가? 서버에 저장을 할테데 아니면 브라우저? 아마도 캐시? 허용알림이 뜨니까?
var swRegist = null;

//ServerPublicKey 암호화처리
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// 구독 버튼 상태 갱신
function updateButton() {
  //알림 권한 거부 처리
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked';
    pushButton.disabled = true;
    updateSubscription(null);
    return;
  }
  const pushButton = document.getElementById('subscribe')
  if (isSubscribed) {
    pushButton.textContent = 'PUSH OFF';
  } else {
    pushButton.textContent = 'PUSH ON';
  }
  pushButton.disabled = false;
}

// 구독 정보 갱신
function updateSubscription(subscription) {
  //변경된 구독정보 서버로 전송
  fetch('/register', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      title: "updateSubscription",
      subscription: subscription,
      isSubscribed: isSubscribed
    }),
  });
  /*구독정보를 확인하기위해 추가
  let detailArea = document.getElementById('subscription_detail')
  if (subscription) {
    detailArea.innerText = JSON.stringify(subscription)
    detailArea.parentElement.classList.remove('hide')
  } else {
    detailArea.parentElement.classList.add('hide')
  }*/
}

// 알림 구독
function subscribe() {
  swRegist.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerPublicKey
    })
    .then(subscription => {
      console.log('User is subscribed.');
      isSubscribed = true;
      updateSubscription(subscription);
      updateButton();
    })
    .catch(err => {
      console.log('Failed to subscribe the user: ', err);
      updateButton();
    });
}

// 알림 구독 취소
function unsubscribe() {
  swRegist.pushManager.getSubscription()
    .then(subscription => {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(error => {
      console.log('Error unsubscribing', error);
    })
    .then(() => {
      console.log('User is unsubscribed.');
      isSubscribed = false;
      updateSubscription(null);
      updateButton();
    });
}

// Push 초기화
function initPush() {
  const pushButton = document.getElementById('subscribe')
  pushButton.addEventListener('click', () => {
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  });

  swRegist.pushManager.getSubscription()
    .then(function(subscription) {
      if (isSubscribed === false) {
        subscription = null;
      }
      //isSubscribed = !(subscription === null);
      updateSubscription(subscription);
      if (isSubscribed) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }
      updateButton();
    });
}

//아래에 서비스워커 등록
//서비스워커를 최초 한번만 등록 하고 추후에 페이지에 방문할때는 이 코드가 실해되지 않았으면 좋겠다
//이 코드가 실행될때마다 구독 정보를 서버로 전송하는데 한번만 전송하면 되는데!!! 계속 전송된다.
//그래서 브라우저에 서비스워커가 등록되어있으면(최초 한번등록) 이 코드는 실행안되게 하는 방법이 있을까
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/index/service-worker.js').then(async function(regist) {
      swRegist = regist;
      console.log('Service Worker Registered');

      // 서버로 부터 공개키와 사용자의 구독 여부를 받아온다
      const response = await fetch('/vapidPublicKey');
      const pushInfo = await response.json();
      console.log(response);
      console.log(pushInfo);

      //비회원일경우 서버에서 publicVapidKey를 false를 전송한다
      //비회원은 push기능을 지원하지 않는다.
      if (!pushInfo.publicVapidKey) {
        console.log("비회원은 PUSH기능을 지원하지 않습니다");
        //const pushButton = document.getElementById('subscribe')
        const pB = document.getElementById('pB')
        pB.remove(); // id가 'div-02' 인 div를 제거합니다
        return;
      }

      appServerPublicKey = urlB64ToUint8Array(pushInfo.publicVapidKey);
      isSubscribed = pushInfo.isSubscribed;

      //Push 기능 초기화
      initPush();

      return swRegist.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerPublicKey
      });
    }).then(function(subscription) {
      //사용자의 isSubscribed를 판단하여 구독 정보를 서버로 전송한다.
      if (isSubscribed === false) {
        subscription = null;
      }
      //구독 정보를 서버로 전송한다.
      fetch('/register', {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          title: "LOAD_PAGE",
          subscription: subscription,
          isSubscribed: isSubscribed
        }),
      });
    });
  });
}
