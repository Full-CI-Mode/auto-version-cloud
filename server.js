var express = require("express");
var cors = require("cors");
var keygen = require("keygenerator");
var fs = require("firebase-admin");
var filesystem = require("fs")




var bodyParser = require("body-parser");
var regexOrigin = new RegExp("^https?://([a-z].*)?koors.io$"); //koors.io
  function createserver() {

  var serviceAccount ={}
  
  if ( filesystem.existsSync('./creds.json')) {
    
    if (filesystem.readFileSync('./creds.json').length === 0) {
      console.log('exists');
      filesystem.writeFileSync("./creds.json",process.env.CREDS);
       serviceAccount= require("./creds.json");


  
    } else {
      filesystem.writeFileSync("./creds.json",process.env.CREDS);
      console.log("nope");
       serviceAccount = require("./creds.json");

        return JSON.parse(filesystem.readFileSync('./creds.json'));
    }
  }

  fs.initializeApp({
    credential: fs.credential.cert(serviceAccount),
    databaseURL: "https://alzheimer-mate.firebaseio.com",
  });
  const db = fs.firestore();
  const projectsDb = db.collection("products");

  let corsOptions = {
    origin: function (origin, callback) {
      if (regexOrigin.test(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  };
  var app = express();
  var router = express.Router();
  app.disable("x-powered-by");
  router.use(cors(corsOptions));
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: false, limit: "1000mb" }));
  router.use(function (req, res, next) {
    var origin = req.headers.origin;
    if (regexOrigin.test(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Cache-Control", "no-store,no-cache,must-revalidate");
    res.header("Vary", "Origin");
    next();
  });

  router.get("/", function (req, res) {
    res.send("Hello World");
  });

  router.post("/projects/register", async (req, res) => {
    const isNotUnique = await db
      .collection("products")
      .doc(req.body.Project.Name)
      .get();
      console.log(isNotUnique);

    if ((isNotUnique.data())/*&&(isNotUnique.data().Project.Name==req.body.Project.Name)*/) {
      res.send({
        message: "Project already exists!",
        project: isNotUnique.data().Project,
      });
    } else {
      const secret = keygen._({
        forceUppercase: true,
      });

      const project = projectsDb.doc(req.body.Project.Name).set({
        Project: {
          Name: req.body.Project.Name,
          Description: req.body.Project.Description,
          Repository: req.body.Project.Repository,
          CurrentVersion: req.body.Project.CurrentVersion,
          Pre: {
            Enabled: req.body.Project.Pre.Enabled,
            Denotation: req.body.Project.Pre.Denotation,
          },
          Details: {
            Number: req.body.Project.Details.Number,
            CommitId: req.body.Project.Details.CommitId,
            TagLink: req.body.Project.Details.TagLink,
            ReleaseNotes: req.body.Project.Details.ReleaseNotes,
            BuildNumber: req.body.Project.Details.BuildNumber,
          },
        },
        secret: secret,
      });
      res.send({
        message: "Project registered!",
        transactionDetails: {
          transactionId: keygen.transaction_id({
            length: 10,
          }),
          Project: {
            Name: req.body.Project.Name,
            Version: req.body.Project.CurrentVersion,
            credentials: {
              warning:
                "This the key you'll be using to interract with your auto version!\n DON'T LOSE IT OR SHARE IT!!",
              secret: secret,
            },
          },
        },
      });
    }
  });

  router.post("/projects/update", async (req, res) => {
    const isNotUnique = await db
    .collection("products")
    .doc(req.body.Project.Name)
    .get();
    if (!isNotUnique) {
      res.send({
        message: "No Project with such name!"
      })
    } else {
      if (isNotUnique.data().secret==req.body.secret) {
        const project = await
 db.collection('products').doc(req.body.Project.Name).set({Project:req.body.Project})
      res.send(project)
      } else {
        res.send({
          message: "Please check your credentials!"
        })
      }
    }

  });

  app.use("/", router);

  return app;
}

module.exports = createserver;
