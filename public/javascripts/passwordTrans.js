var crypto = require('crypto')

//단방향 암호화
//사용자의 비밀번호를 굳이 복호화 할필요가 없고 로그인시 비교할때도 입력받은 비밀번호를 암호화 시켜 비교하면 된다.
//upgradeBase64crypto라는 함수의 randomBytes 메소드에서 64바이트 길이의 임의의 문자열(salt)을 생성
//pbkdf2 메소드에서는 순서대로 비밀번호, salt, 반복 횟수, 출력될 바이트 수, 해시 알고리즘을 parameter로 받는다.
//salt는 랜덤이기 떄문에 비밀번호와 같이 저장되어야한다.
//Base64 : 바이너리 데이터를 6비트 단위로 끊어 인코드, 디코드 하는 인코딩 기법
exports.encoding=function (psw, callback){
    var result = {};
    crypto.randomBytes(64, (err, buf) => {
      const salt = buf.toString('base64')
      crypto.pbkdf2(psw, salt, 99581, 64, 'sha512', (err, key) => {
        result.salt = salt;
        result.password = key.toString('base64'); //key는 버퍼형식으로 return되기 때문에 문자열변환
        callback(result);
      })
    })
}

exports.decoding=function (password,salt, callback){
    var result = {};
    crypto.randomBytes(64, (err, buf) => {
      //const salt = buf.toString('base64')
      crypto.pbkdf2(password, salt, 99581, 64, 'sha512', (err, key) => {
        password = key.toString('base64'); //key는 버퍼형식으로 return되기 때문에 문자열변환
        callback(password);
      })
    })
}
