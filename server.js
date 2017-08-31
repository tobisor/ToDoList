/**
 * Created by Omer on 16/8/2017.
 */
var COOCKIETIME = 3600000;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
module.export = app;
var router = express.Router();

var port = process.env.Port || 8080;
app.use(express.static(__dirname+"/public"));
app.use(favicon(path.join(__dirname, 'public', 'latest.jpg')));

app.use(logger('dev'));
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use(bodyParser.text({type: '*/*'}));
app.use(cookieParser(1));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    next();
});

var userCounter = 0;
var registerdUser = [];


registerdUser["omer"] = new Object();
registerdUser["omer"].password = "123";
registerdUser["omer"].uid = userCounter;
registerdUser["omer"].shared = [];
registerdUser["omer"].lists = [];
userCounter++;
registerdUser["or"] = new Object();
registerdUser["or"].password = "123";
registerdUser["or"].uid = userCounter;

registerdUser["or"].shared = [];
userCounter++;


var todolist = new Object();
todolist.name = 'mars';
todolist.owner = 'or';
todolist.jobs = ['omer', 'is', 'a', 'pain'];
todolist.color = '#efe856';
todolist.shared = false;
registerdUser["or"].lists = [todolist];

var todolistII = new Object();
todolistII.name = 'mars2';
todolistII.owner = 'or';
todolistII.jobs = ['o', 'om', 'ome', 'omer'];
todolistII.color = '#ff5d5b';
todolistII.shared = false;
registerdUser["or"].lists.push(todolistII);


/***************get requests for html pages*********************/
app.get('/', function (req, res) {
    console.log("GET login")
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/login/', function (req, res) {
    console.log("GET login")
    res.sendFile(__dirname + '/public/login.html');
});

app.get('public/login.html', function (req, res) {
    console.log("GET login")
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/register/', function (req, res) {
    console.log("GET register")
    res.sendFile(__dirname + '/public/register.html');
});

app.get("/shared/", function (req, res) {
    var usr = findUser(req);
    //console.log("SHARED: " + registerdUser[usr].shared)
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: COOCKIETIME})
        res.status(200).sendFile(__dirname + '/public/shared.html');
    } else {
        res.send('500');
        res.sendFile(__dirname + '/public/login.html');
    }
});

app.post("/register/:username/:password", function (req, res) {
    console.log("POST register")
    var username = req.params.username;
    var pass = req.params.password;
    if (!registerdUser[username]) {
        registerdUser[username] = new Object();
        registerdUser[username].uid = userCounter;
        registerdUser[username].password = pass;
        registerdUser[username].lists = [];
        registerdUser[username].shared = [];
        userCounter++;
        console.log("regArray int " + username + " is " + JSON.stringify(registerdUser[username]))
        res.cookie("uid", registerdUser[username].uid, {maxAge: COOCKIETIME});
        console.log("cookie");
        res.send('200');
        //sendFile(__dirname + '/public/item.html');
    } else {
        res.send('500');
        console.log("hi");
    }
});

app.post("/login/:username/:password", function (req, res) {
    var username = req.params.username;
    var pass = req.params.password;
    console.log("got req");
    //user exist and password match
    if ((registerdUser[username]) && (registerdUser[username].password === pass)) {
        //console.log("cookie ! and the uid is " + registerdUser[username].uid );
        res.cookie("uid", registerdUser[username].uid, {maxAge: COOCKIETIME});
        //console.log(JSON.stringify(Object.keys(registerdUser)));
        res.status(200).send('200');
    } else {
        //console.log(JSON.stringify(Object.keys(registerdUser)));
        //console.log("wrong username/password")
        res.send("500");
    }
});

app.get("/item/", function (req, res) {
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: COOCKIETIME})
        res.status(200).sendFile(__dirname + '/public/item.html');
    } else {
        //res.status(500);
        res.sendFile(__dirname + '/public/login.html');
    }
});
//////////////LOGOUT//////////////
app.get("/logout/", function (req, res) {
    var usr = findUser(req);
    if (usr) {
        res.clearCookie('uid');
        res.redirect('/');
        if (registerdUser[usr]) {
            res.status(200).send('200');
        } else {
            res.send('404');
        }
    } else {
        res.ssend('500');
    }
});

app.get("/userlists/", function (req, res) {
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: COOCKIETIME})
        if (registerdUser[usr]) {
            var obj = {};
            obj.lists = registerdUser[usr].lists;
            obj.userName = usr.toUpperCase();
            var urlString = JSON.stringify(obj);
            console.log(urlString);
            res.status(200).send(obj);
        } else {
            res.send('404');
        }
    } else {
        res.send('500');
    }
});

app.get("/sharedlists/", function (req, res) {
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: COOCKIETIME})
        if (registerdUser[usr]) {
            var obj = [];
            for (var i = 0; i < registerdUser[usr].shared.length;) {
                if (registerdUser[usr].shared[i] &&
                    registerdUser[registerdUser[usr].shared[i].owner] &&
                    (findList(registerdUser[usr].shared[i].owner, registerdUser[usr].shared[i].name) !== -1)) {
                    obj.push(registerdUser[usr].shared[i]);
                    i++;
                } else {
                    registerdUser[usr].shared.splice(i, 1);
                }
            }
            var urlString = JSON.stringify(obj);
            console.log(urlString);
            res.status(200).send(obj);
        } else {
            res.send('404');
        }
    } else {
        res.send('500');
    }
});

////////////ADD JOB////////////////
app.post("/addJob/", function (req, res) {
    console.log(req.body);
    var itemJson = JSON.parse(req.body); //parse item into json
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        var index = findList(usr, itemJson.listName);
        if (index !== -1) {  //if list exists
            var jobIndex = findJob(usr, index, itemJson.job);
            if (jobIndex === -1) { //if job doesn't exist
                res.cookie('uid', curUid, {maxAge: COOCKIETIME});
                registerdUser[usr].lists[index].jobs.push(itemJson.job);
                res.status(200).send('200');
            } else {
                res.send('503');
            }
        } else {
            res.send('404');
        }
    } else {
        res.send('500');

    }
});
//////////////////////////////SHARE LIST///////////////////////////////
app.post("/item/share/", function (req, res) {
    console.log(req.body)
    var itemJson = JSON.parse(req.body) //parse item into json
    var usr = findUser(req);
    var other = itemJson.otherUserName;
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: COOCKIETIME})
        var lst = itemJson.listName;
        var index = findList(usr, lst);
        if (registerdUser[other]) {  //other user does exist?
            //other user have list with this name in his shared lists
            if (findListInShared(other, lst) !== -1) {
                res.send('503');
            }
            if (index != -1 && !registerdUser[usr].lists[index].shared) {  //if list exists and is not shared yet
                registerdUser[usr].lists[index].shared = true;
                //add list to other's shared
                registerdUser[other].shared.push(registerdUser[usr].lists[index]);
                res.status(200).send('200');
            } else {
                res.send('404');
            }
        } else {
            res.send('404');
        }
    } else {
        res.send('500');
    }
});
//////////////NEW LIST////////////////NEW LIST////////////////////NEW LIST////////////NEW LIST////////////NEW LIST/////////////
app.post("/item/", function (req, res) {
    console.log("body of add list req (POST) is " + req.body);
    var itemJson = JSON.parse(req.body) //parse item into json
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: COOCKIETIME})
        if (findList(usr, itemJson.listName) === -1) {  //if item doesn't exist
            var newList = new Object();
            newList.color = itemJson.color;
            newList.name = itemJson.listName;
            newList.jobs = [];
            newList.shared = false;
            newList.owner = usr;
            registerdUser[usr].lists.push(newList);//this one works but its not maintainable

            console.log("user: " + JSON.stringify(registerdUser[usr]));
            console.log("his lists: " + registerdUser[usr].lists.length);
            res.status(200).send('200');
        } else {
            res.send('404');
        }
    } else {
        res.send('500');

    }
});
///////////MA PUT?////////////
/*app.put("/item/", function(req, res,next){
 console.log(req.body)
 var itemJson= JSON.parse(req.body) //parsing item to json
 var usr = findUser(req);
 if (usr) {
 var curUid = req.cookies.uid;
 res.cookie('uid', curUid, {maxAge: COOCKIETIME})
 if (registerdUser[usr].lists[itemJson.name]){        //if item exist
 Object.keys(itemJson).forEach(function (key){
 if(itemJson[key]) {     //if key has value
 registerdUser[usr].lists[itemJson.name][key] = itemJson[key];
 }
 })
 }else {
 res.status(404).send('404');
 }
 }else{
 res.status(500).send('500');
 }
 });*/
////////////DELETE LIST////////////////
app.delete("/item/deleteList/:listName", function (req, res) {
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        var lst = req.params.listName;
        res.cookie('uid', curUid, {maxAge: COOCKIETIME})
        var index = findList(usr, lst);
        if (index !== -1) {
            //delete and edit item counter
            registerdUser[usr].lists.splice(index, 1);
            res.status(200).send('200');
        } else {
            res.send('404');
        }
    } else {
        res.send('500');
    }
});
///////////////DELETE USER////////////////////
app.delete("/item/deleteUser", function (req, res) {
    var usr = findUser(req);
    if (usr) {
        if (registerdUser[usr]) {
            var length = registerdUser[usr].shared.length;
            for (var i = 0; i < length; i++) {
                makeListSharedableAgain(registerdUser[usr].shared[i]);
            }
            delete registerdUser[usr];
            console.log(JSON.stringify(Object.keys(registerdUser)));
            res.clearCookie('uid');
            res.status(200).send('200');
        } else {
            res.send('404');
        }
    } else {
        res.send('500');
    }
});
////////////////DELETE JOB//////////////
app.delete("/item/deleteItem", function (req, res) {
    console.log(req.body);
    var itemJson = JSON.parse(req.body);
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        var lst = itemJson.listName;
        var itm = itemJson.itemName;
        res.cookie('uid', curUid, {maxAge: COOCKIETIME});
        var listIndex = findList(usr, lst);
        var jobIndex = findJob(usr, listIndex, itm);
        console.log("list index is :" + listIndex);
        console.log("job index is: " + jobIndex);
        if (listIndex !== -1 && jobIndex !== -1) {
            registerdUser[usr].lists[listIndex].jobs.splice(jobIndex, 1);
            res.status(200).send('200');
        } else {
            res.send('404');
        }
    } else {
        res.send('500');
    }
});

/**
 * function to check validity of cookies
 * @param req
 * @returns {boolean} - if cookie is vaalid or not
 */
/* function verifyAccess(req) {

 var cuid = req.cookies.uid;

 var verified = false;
 if (cuid){
 Object.keys(registerdUser).forEach(function(user){

 if (cuid == registerdUser[user].uid){
 verified = true;
 }
 });
 }

 return verified;
 }  */


/**
 * find the list index in user.lists array
 * @param user
 * @param listName
 * @returns {number}
 */
function findList(user, listName) {
    var length = registerdUser[user].lists.length;
    for (var i = 0; i < length; i++) {
        if (registerdUser[user].lists[i].name === listName) {
            return i
        }
    }
    return -1;
}
/**
 * find the list index in user shared lists array
 * @param user
 * @param listName
 * @returns {number}
 */
function findListInShared(user, listName) {
    var length = registerdUser[user].shared.length;
    for (var i = 0; i < length; i++) {
        if (registerdUser[user].shared[i].name === listName) {
            return i
        }
    }
    return -1;
}

/**
 * make the original list of sharedList shared-able again
 * (used when deleting user)
 * @param sharedList
 */
function makeListSharedableAgain(sharedList) {
    var owner = sharedList.owner;
    var name = sharedList.name;
    var listIndex = findList(owner, name);
    if (listIndex > -1) {
        registerdUser[owner].lists[listIndex].shared = false;
    }
}

/**
 * find the job index in the list
 * @param user
 * @param listIndex
 * @param jobName
 * @returns {number}
 */
function findJob(user, listIndex, jobName) {
    var length = registerdUser[user].lists[listIndex].jobs.length;
    for (var i = 0; i < length; i++) {
        if (registerdUser[user].lists[listIndex].jobs[i] === jobName) {
            return i;
        }
    }
    return -1;
}

/**
 * check validity of cookie and return user name
 * @param req
 * @returns {number}
 */
function findUser(req) {
    var cuid = req.cookies.uid;
    var usr = null;
    if (cuid) {
        Object.keys(registerdUser).forEach(function (user) {
            if (cuid == registerdUser[user].uid) {
                usr = user;
            }
        });
    }
    return usr;
}

/******LISTEN*******/
app.listen(port);
console.log('listening to ' + port);
