module.exports = {
  statusUI: function(req, res) {
    var user = false;
    try{
        user = req.session.passport.user;
    }catch(err){
    }

    var info = {
      state : "nonMember",
      nickname: undefined,
    }

    if (this.isOwner(user)) {
      info.state = "Member";
      info.nickname = user.id;
    }

    return info;

  },
  isOwner: function(user) {
    if (user) { //req.user로 passport정보를 가져올수있다.
      return true;
    } else {
      return false;
    }
  }
}
