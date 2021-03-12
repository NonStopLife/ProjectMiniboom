var socket = io()

/*
 *
 */
function startSocket() {
  connect();
  update();
  loadData();
  newUser_notice();
  disconnect();
}

/*
 * 유저 입장시 입장 알림메시지 출력
 */
function loadData() {
  socket.on('loadData', function(data) {
    var nickname = data.name

    for (var index in data.loadData) {
      var load_data = data.loadData[index];

      var chat = document.getElementById('chat');
      var message = document.createElement('div');
      var name = document.createElement('div');
      var content = document.createElement('div');
      var time = document.createElement('div');
      time.setAttribute("class", "time");

      var name_Node = document.createTextNode(`${load_data.user_id}`);
      var content_Node = document.createTextNode(`${load_data.chat_data}`);
      var time_Node = document.createTextNode(`-${load_data.chat_time}-`);

      //classname은 css를 적용하기 위해 부여 at 2021-02-26
      var className = 'other';
      if (nickname === load_data.user_id) {
        className = 'me';
      }

      message.classList.add(className);
      name.appendChild(name_Node);
      content.appendChild(content_Node);
      time.appendChild(time_Node);
      message.appendChild(name);
      message.appendChild(content);
      message.appendChild(time);
      chat.appendChild(message);

      // console.log(message);
      // console.log(time);
    }

    socket.emit('newUser_notice');
  })
}

/*
 * 유저 입장시 입장 알림메시지 출력
 */
function newUser_notice() {
  socket.on('newUser_notice', function(data) {
    //console.log("NEW", data);
    var chat = document.getElementById('chat')
    var message = document.createElement('div')
    var node = document.createTextNode(`${data.name} 님이 접속하셨습니다.`)
    //class type connect disconnect other me
    var className = 'connect'

    message.classList.add(className);
    message.appendChild(node);
    chat.appendChild(message);
    $("#chat").scrollTop($("#chat")[0].scrollHeight);
  })
}

/* 접속 되었을 때 실행 */
function connect() {
  socket.on('connect', function() {
    /* 서버에 새로운 유저가 왔다고 알림 */
    socket.emit('newUser');
  })
}

function disconnect() {
  socket.on('disconnection', function(data) {

    var chat = document.getElementById('chat')
    var message = document.createElement('div')
    var node = document.createTextNode(`${data.message} 님이 나가셨습니다.`)
    var className = 'disconnect'

    // 화면에 출력
    message.classList.add(className)
    message.appendChild(node)
    chat.appendChild(message)

    // 스크롤바 맨 아래로
    $("#chat").scrollTop($("#chat")[0].scrollHeight);
  });
}

/*
 * 서버로부터 데이터 받은 경우
 */
function update() {
  socket.on('update', function(data) {
    var today = new Date();
    var hours = today.getHours(); // 시
    var minutes = today.getMinutes(); // 분
    var localtime = `${hours} : ${minutes}`;
    var nickname = $('#nickname').val();

    var chat = document.getElementById('chat');
    var message = document.createElement('div');
    var name = document.createElement('div');
    var content = document.createElement('div');
    var time = document.createElement('div');
    time.setAttribute("class", "time");

    var name_Node = document.createTextNode(`${data.name}`);
    var content_Node = document.createTextNode(`${data.message}`);
    var time_Node = document.createTextNode(`-${localtime}-`);

    var className = 'other';
    if (nickname === data.name) {
      className = 'me';
    }

    message.classList.add(className);
    name.appendChild(name_Node);
    content.appendChild(content_Node);
    time.appendChild(time_Node);
    message.appendChild(name);
    message.appendChild(content);
    message.appendChild(time);
    chat.appendChild(message);

    // 스크롤바 맨 아래로
    $("#chat").scrollTop($("#chat")[0].scrollHeight);
    $("#test").focus();
  });
}



/* 메시지 전송 함수 */
function send() {
  // 입력되어있는 데이터 가져오기
  var message = document.getElementById('test').value

  // 가져왔으니 데이터 빈칸으로 변경
  document.getElementById('test').value = ''


  $("#chat").scrollTop($("#chat")[0].scrollHeight);
  $("#test").focus();

  // 서버로 message 이벤트 전달 + 데이터와 함께
  socket.emit('message', {
    message: message
  });

}

function enterkey() {
  window.addEventListener("keydown", (e) => {
    const key = e.key
    if (key == "Enter") {
      send();
    }
  })

  window.addEventListener("keyup", (e) => {
    const key = e.key
  })
}
