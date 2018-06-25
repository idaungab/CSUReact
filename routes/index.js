var express = require('express');
var router = express.Router();
var helmet = require('helmet');
var crypto = require('crypto');
const bodyParser = require('body-parser');
const logger = require('morgan');

let pg = require('pg');

const config = {
	port:5432,
	database:'enrolment',
	user:'postgres',
	host:'192.168.5.146',
	password:'reactjs',
	max:Infinity,
	connectionTimeoutMillis: 3000
}
var r_pass = crypto.randomBytes(128);
// convert passphrase to base64 format
var passphrase = r_pass.toString("base64");

let pool = new pg.Pool(config);
router.use(helmet())
router.use(logger('dev'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

router.use(function(request, response, next){
	response.header("Access-Control-Allow-Origin","*");
	response.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type, Accept");
	next();
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/crypto/passphrase',function(request,response){
	response.send({"passphrase":passphrase});
})
router.get('/getRoom',function(req, res){
	var token = req.body.token;
	if(passphrase !== token){
		pool.connect((err,db,done) => {
		if(err) {
		console.log(err)
		}
		else{
			db.query('SELECT * from room',(err,table) => {
			if(err){
			console.log(err);
			}
			else{
			db.end();
			res.send({data:table.rows});
			}
	   	  })
		 }
		})
	}
	else{
		res.send({data:"error"});
	}

});
router.get('/studentData',function(req, res){
	pool.connect((err,db,done) => {
	if(err) {
	console.log(err)
	}
	else{
		db.query('SELECT * from student',(err,table) => {
		if(err){
		console.log(err);
		}
		else{
		db.end();
		res.send(table.rows);
		}
   	  })
	 }
	})
});

router.post('/checkRoom',function(req, res){

	var room = req.body.room;

	pool.connect((err,db,done) => {
	if(err) {
	console.log(err)
	}
	else{
		db.query('SELECT * from room WHERE upper(room) = upper($1)',[room],(err,table) => {
		if(err){
		console.log(err);
		}
		else{
			db.end();
			var count = table.rows.length;
			if(count>0){
				res.send({"message":"exist"});
			}
			else{
				res.send({"message":"ok"});
			}

		}
   	  })
	 }
	})

});
router.post('/addRoom',function(request,response){
		var room = request.body.room;
  	var building = request.body.bldg;
  	var capacity = request.body.capacity;
  	var type = request.body.rtype;

	pool.connect((err,db,done) =>{
    if(err) {
      return console.log(err);
    }
    else {
      db.query('INSERT INTO room(room,bldg,capacity,rtype) VALUES ($1,$2,$3,$4)',[room,building,capacity,type],(err,table) => {
      done();
      if(err){
        console.log(err);
       return response.send({"message":"error"});
      }
      else {
        return response.status(200).send({"message":"success"});
        db.end();
      }
     })
  		// return response.status(200).send(startdate);
    }
  	}) // end pool
});

router.post('/updateRoom',function(request,response){
		var room = request.body.room;
		var building = request.body.bldg;
  	var oldBuilding = request.body.oldbldg;
  	var capacity = request.body.capacity;
		var available = request.body.available;
  	var type = request.body.rtype;

		var isNull = capacity.length;

  	pool.connect((err,db,done) =>{
    if(err) {
      return console.log(err);
    }
    else {
			if(isNull === 0 ){
				 var capacity = null;
				 db.query('UPDATE room SET bldg = $1, capacity = $2, available = $3, rtype = $4 WHERE room = $5 AND bldg = $6',[building,capacity,available,type,room,oldBuilding],(err,table) => {
	       done();
	       if(err){
	        console.log(err);
	        return response.send({"message":"error"});
	       }
	       else {
	         return response.send({"message":"success"});
	         db.end();
	       }
	      })
			}
			else{
				 var capacity = request.body.capacity;
				 db.query('UPDATE room SET bldg = $1, capacity = $2, rtype = $3 WHERE room = $4 AND bldg = $5',[ building,capacity,type,room,oldBuilding],(err,table) => {
	       done();
	       if(err){
	         console.log(err);
	        return response.send({"message":"error"});
	       }
	       else {
	         return response.send({"message":"success"});
	         db.end();
	       }
	      })
			}
    }
  })
});

router.get('/building',function(req, res){
	pool.connect((err,db,done) => {
	if(err) {
	console.log(err)
	}
	else{
		db.query('SELECT * from building',(err,table) => {
		if(err){
		console.log(err);
		}
		else{
		db.end();
		res.send(table.rows);
		}
   	  })
	 }
	})
});

router.get('/bldg',function(req, res){
	pool.connect((err,db,done) => {
	if(err) {
	console.log(err)
	}
	else{
		db.query('SELECT * from building',(err,table) => {
		if(err){
		console.log(err);
		}
		else{
		db.end();
		res.send(table.rows);
		}
   	  })
	 }
	})
});

router.get('/term', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT * from sysem ORDER BY sysemno ASC', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
router.post('/addTerm',function(request,response){
		var sy = request.body.sy;
  	var sem = request.body.sem;
  	var startdate = request.body.startdate;
  	var enddate = request.body.enddate;
  	var startclass = request.body.startclass;
  	var grade_submit = request.body.grade_submit;
  	var grade_submit_fin = request.body.grade_submit_fin;
		var inc_expiration = request.body.inc_expiration;

	if(startdate == ''){
		startdate = null;
	}
	if(enddate == ''){
		enddate = null;
	}
	if(startclass == ''){
		startclass = null;
	}
	if(grade_submit == ''){
		grade_submit = null;
	}
	if(grade_submit_fin == ''){
		grade_submit_fin = null;
	}
	if(inc_expiration == ''){
		inc_expiration = null;
	}

	pool.connect((err,db,done) =>{
    if(err) {
      return console.log(err);
    }
    else {
      db.query('INSERT INTO sysem(sy,sem,startdate,enddate,startclass,grade_submit,grade_submit_fin,inc_expiration) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[sy,sem,startdate,enddate,startclass,grade_submit,grade_submit_fin,inc_expiration],(err,table) => {
      done();
      if(err){
        console.log(err);
       return response.send({"message":"error"});
      }
      else {
        return response.status(200).send({"message":"success"});
        db.end();
      }
     })
  		// return response.status(200).send(startdate);
    }
  	}) // end pool
});

router.post('/updateTerm',function(request,response){
	var sy = request.body.sy;
  	var sem = request.body.sem;
  	var sysemno = request.body.sysemno;
  	var startdate = request.body.startdate;
  	var enddate = request.body.enddate;
  	var startclass = request.body.startclass;
  	var grade_submit = request.body.grade_submit;
  	var grade_submit_fin = request.body.grade_submit_fin;
	var inc_expiration = request.body.inc_expiration;
	var sysemno = request.body.sysemno;

	if(startdate == ''){
		startdate = null;
	}
	if(enddate == ''){
		enddate = null;
	}
	if(startclass == ''){
		startclass = null;
	}
	if(grade_submit == ''){
		grade_submit = null;
	}
	if(grade_submit_fin == ''){
		grade_submit_fin = null;
	}
	if(inc_expiration == ''){
		inc_expiration = null;
	}

  	pool.connect((err,db,done) =>{
    if(err) {
      return console.log(err);
    }
    else {
      db.query('UPDATE sysem SET sy = $1, sem = $2,sysemno = $3, startdate = $4, enddate = $5, startclass = $6, grade_submit = $7, grade_submit_fin = $8, inc_expiration = $9 WHERE sysemno = $10',[sy,sem,sysemno,startdate,enddate,startclass,grade_submit,grade_submit_fin,inc_expiration,sysemno],(err,table) => {
      done();
      if(err){
        console.log(err);
       return response.send({"message":"error"});
      }
      else {
        return response.status(200).send({"message":"success"});
        db.end();
      }
     })
  		// return response.status(200).send(startdate);
    }
  })
});
router.get('/program', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT * from program', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
router.get('/college', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT * from college', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
router.post('/addCollege',function(request,response){
  var colcode = request.body.colcode;
  var college = request.body.college;
  var empid = request.body.empid;

  pool.connect((err,db,done) =>{
    done();
    if(err){
      return response.status(400).send(err);
    }else{
      db.query('INSERT INTO college (colcode,college,empid) VALUES ($1,$2,$3)', [colcode,college,empid], (err,table) => {
        if(err){
					console.log(err);
          return response.send({"message":"error"});
        }else{
          return response.send({"message":"success"});
        }
      })
    }
  })
});
router.get('/collegeName', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT distinct colcode,college from college', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
router.post('/updateCollege',function(request,response){
	var colcode = request.body.colcode;
	var colcodeNew = request.body.colcodeNew;
  var college = request.body.college;
  var empid = request.body.empid;


  	pool.connect((err,db,done) =>{
    if(err) {
      return console.log(err);
    }
    else {
      db.query('UPDATE college SET colcode = $1, college = $2, empid = $3 WHERE colcode = $4',[colcodeNew,college,empid,colcode],(err,table) => {
      done();
      if(err){
        console.log(err);
       return response.send({"message":"error"});
      }
      else {
        return response.status(200).send({"message":"success"});
        db.end();
      }
     })
  		// return response.status(200).send(startdate);
    }
  })
});
router.get('/department', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT * from department', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
router.get('/departmentName', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query("SELECT deptname,deptcode from department WHERE deptname != '' ", (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
router.get('/COLLEGEandDEPARTMENT', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query("SELECT deptcode,deptname,colcode,college.college,college.empid from college,department where college.colcode=department.college;", (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
router.get('/collegeCode', function(req, res) {
	var colCode = req.body.colCode;

  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query("SELECT college from college WHERE colcode = $1",[colCode],(err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
router.post('/addDepartment',function(request,response){
	var deptcode = request.body.deptcode;
	var deptname = request.body.deptname;
  var active = request.body.active;
	var college = request.body.college;
  var empid = request.body.empid;

  let values = [deptcode,deptname,active,college,empid];
  pool.connect((err,db,done) =>{
    done();
    if(err){
      return response.status(400).send(err);
    }else{
      db.query('INSERT into department (deptcode,deptname,active,college,empid)values($1,$2,$3,(select colcode from college where college.college = $4),$5)', [...values], (err,table) => {
        if(err){
          return response.status(400).send(err);
					console.log(err);
        }else{
          console.log('Department inserted');
          response.status(201).send({message:'Data inserted'});
        }
      })
    }
  })
});

router.post('/updateDepartment',function(request,response){
	var deptcode = request.body.deptcode;
	var deptname = request.body.deptname;
  var active = request.body.active;
	var college = request.body.college;
  var empid = request.body.empid;

	let values = [deptcode,deptname,active,college,empid];
	console.log(values);
  pool.connect((err,db,done) =>{
    done();
    if(err){
      return response.status(400).send(err);
			console.log(values);
    }else{
      db.query('UPDATE department SET deptcode=$1,deptname=$2,active=$3,college=(SELECT colcode FROM college WHERE college= $4 ),empid=$5  WHERE deptcode=$1', [...values], (err,table) => {
        if(err){
          return response.status(400).send(err);
					console.log(err);
					console.log(values);
        }else{
          console.log('Data updated');
          response.status(201).send({message:'Data updated'});
        }
      })
    }
  })
});


router.post('/addProgram',function(request,response){
	var progcode = request.body.progcode;
	var progdesc = request.body.progdesc;
  var is_active = request.body.is_active;
	var undergrad = request.body.undergrad;
  var progdept = request.body.progdept;
  var major = request.body.major;
	var masteral = request.body.masteral;
	var phd = request.body.phd;
	var shorthand = request.body.shorthand;

	let values= [progcode,progdesc,is_active,undergrad,progdept,major,masteral,phd,shorthand];

  pool.connect((err,db,done) =>{
    done();
    if(err){
      return response.status(400).send(err);
    }else{
      db.query('INSERT into program (progcode,progdesc,is_active,undergrad,progdept,major,masteral,phd,college,shorthand)values($1,$2,$3,$4,(SELECT deptcode from department WHERE deptname = $5),$6,$7,$8,(select college from department where deptcode = $5 ), $9)', [...values], (err,table) => {
        if(err){
          return response.status(400).send(err);
					console.log(err);
					console.log(values);
        }else{
          console.log('Program inserted');
          response.status(201).send({message:'Data inserted'});
        }
      })
    }
  })
});
router.post('/updateProgram',function(request,response){
	var progcode = request.body.progcode;
	var progdesc = request.body.progdesc;
  var is_active = request.body.is_active;
	var undergrad = request.body.undergrad;
  var progdept = request.body.progdept;
  var major = request.body.major;
	var masteral = request.body.masteral;
	var phd = request.body.phd;
	var shorthand = request.body.shorthand;

	let values= [progcode,progdesc,is_active,undergrad,progdept,major,masteral,phd,shorthand];
	console.log(values);
  pool.connect((err,db,done) =>{
    done();
    if(err){
      return response.status(400).send(err);
			console.log(values);
    }else{
      db.query('UPDATE program SET progcode=$1,progdesc=$2,is_active=$3,undergrad=$4,progdept=(SELECT deptcode from department WHERE deptname = $5),major=$6,masteral=$7,phd=$8,college=(SELECT college FROM department WHERE deptcode = $5),shorthand=$9  WHERE progcode=$1', [...values], (err,table) => {
        if(err){
          return response.status(400).send(err);
					console.log(err);
					console.log(values);
        }else{
          console.log('Data updated');
          response.status(201).send({message:'Data updated'});
        }
      })
    }
  })
});
router.get('/coldept', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query("SELECT college.colcode,college.college from college INNER JOIN department ON college.college = department.college", (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
//********************
//Start Scheduling Module *****
//********************
router.get('/getTBA',function(request,response){
	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT * FROM EMPLOYEE WHERE UPPER(LASTNAME)='TBA'";
			db.query(Query,(err,table) =>{
				if(err){
					console.log(err);
				}
				else{
					db.end();
					response.send(table.rows);
				}
			})
		}
	})
})

//**** Start Get Room Schedule **** //
router.get('/getRoomSched', function(req, res) {
	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = "SELECT * FROM room a WHERE a.available = 'true' ";
			db.query(Query, (err,table) =>{
				if(err){
					console.log(err);
				}
				else {
					db.end();
					res.send(table.rows);
				}
			})
		}
	})
});
//**** End Get Room Schedule **** //

// **** Category Program **** //
router.post('/getCategoryProgram',function(request,response){
	var sy = request.body.sy;
	var sem = request.body.sem;
	var search = request.body.search;

	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			if(search === 'OPEN'){
				var Query = "SELECT DISTINCT B.courseno::varchar, a.subjcode::varchar, " +
        "a.section::varchar, a.sy::varchar, a.sem::varchar, (B.description)::varchar, " +
        " (SELECT array(select distinct (b.days || ' ' || to_char(to_timestamp(b.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') || '-' "+
				" || " +
        " to_char(to_timestamp(b.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')) FROM schedule b " +
        " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as sched, " +
        " (SELECT array(select distinct b.room FROM schedule b " +
        " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as room, " +
        " (SELECT array(select distinct b.empid from schedule b " +
        " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as empid, " +
        " (SELECT array(select distinct initcap(b.lastname || ',' || b.firstname) from employee b " +
        " WHERE b.empid=a.empid))::varchar as instructor, " +
        " 'OPEN'::varchar as progcode, " +
        " c.slots, c.enrollees FROM schedule a, subject b, offeredsubject c, employee e " +
        " WHERE a.subjcode=b.subjcode and a.empid=e.empid and a.sy=c.sy and a.sem=c.sem and a.subjcode=c.subjcode and a.section=c.section " +
        " and a.sy=$1 and UPPER(a.sem)=UPPER($2) and NOT c.is_restricted ";
				db.query(Query,[sy,sem],(err,table) =>{
					if(err){
						console.log(err);
					}
					else{
						db.end();
						response.send(table.rows);
					}
				})
			}
			else if(search === 'REQUESTED'){
				var Query = "SELECT DISTINCT B.courseno::varchar, a.subjcode::varchar, " +
        " a.section::varchar, a.sy::varchar, a.sem::varchar, (B.description)::varchar, " +
        " (SELECT array(select distinct (b.days || ' ' || to_char(to_timestamp(b.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') || '-' "+
				" || " +
        " to_char(to_timestamp(b.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')) FROM schedule b " +
        " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as sched, " +
        " (SELECT array(select distinct b.room FROM schedule b " +
        " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as room, " +
        " (SELECT array(select distinct b.empid from schedule b " +
        " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as empid, " +
        " (SELECT array(select distinct initcap(b.lastname || ',' || b.firstname) from employee b " +
        " WHERE b.empid=a.empid))::varchar as instructor, " +
        " 'OPEN'::varchar as progcode, " +
        " c.slots, c.enrollees FROM schedule a, subject b, offeredsubject c, employee e " +
        " WHERE a.subjcode=b.subjcode and a.empid=e.empid and a.sy=c.sy and a.sem=c.sem and a.subjcode=c.subjcode and a.section=c.section " +
      	" and a.sy=$1 and UPPER(a.sem)=UPPER($2) and c.is_requested ";
				db.query(Query,[sy,sem],(err,table) =>{
					if(err){
						console.log(err);
					}
					else{
						db.end();
						response.send(table.rows);
					}
				})
			}
			else{
				var Query = "SELECT DISTINCT B.courseno::varchar, a.subjcode::varchar, " +
        " a.section::varchar, a.sy::varchar, a.sem::varchar, (B.description)::varchar, " +
        " (SELECT array(select distinct (b.days || ' ' || to_char(to_timestamp(b.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') || ' - ' || " +
        " to_char(to_timestamp(b.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')) FROM schedule b " +
        " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as sched, " +
        " (SELECT array(select distinct b.room FROM schedule b " +
        " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as room, " +
        " (SELECT array(select distinct b.empid from schedule b " +
        " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as empid, " +
        " (SELECT array(select distinct initcap(b.lastname || ', ' || b.firstname) from employee b " +
        " WHERE b.empid=a.empid))::varchar as instructor, " +
        " (SELECT array(select distinct (b.progcode || ' ' || b.studlevel|| b.BLOCK)from offeredfor b " +
        " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as progcode, " +
        " c.slots, c.enrollees FROM schedule a, subject b, offeredsubject c, offeredfor d, employee e " +
        " WHERE a.subjcode=b.subjcode and a.empid=e.empid and a.sy=c.sy and a.sem=c.sem and a.subjcode=c.subjcode and a.section=c.section " +
        " and a.sy=d.sy and a.sem=d.sem and a.subjcode=d.subjcode and a.section=d.section and a.sy=$1 and UPPER(a.sem)=UPPER($2) " +
        " and UPPER(d.progcode) like UPPER($3)";
				db.query(Query,[sy,sem,search],(err,table) =>{
					if(err){
						console.log(err);
					}
					else{
						db.end();
						response.send(table.rows);
					}
				})
			}
		}
	})
});
	// ****End Category Program ****//

	// **** Start Category Instructor ****//
	router.post('/getCategoryInstructor',function(request,response){
		var sy = request.body.sy;
		var sem = request.body.sem;
		var instructor = request.body.search;
	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT DISTINCT b.courseno::varchar, a.subjcode::varchar,a.section::varchar, a.sy::varchar, a.sem::varchar, (b.description)::varchar, "+
		"(SELECT array(select distinct (b.days || ' ' || to_char(to_timestamp(b.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') || ' - '|| "+
		"to_char(to_timestamp(b.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')) FROM schedule b "+
		"WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as sched, "+
		"(SELECT array(select distinct b.room FROM schedule b "+
		"WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as room, "+
		"(SELECT array(select distinct b.empid from schedule b "+
		"WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as empid, "+
		"(SELECT array(select distinct initcap(b.lastname || ','|| b.firstname) from employee b "+
		"WHERE b.empid=a.empid))::varchar as instructor, "+
		"(SELECT array(select distinct (b.progcode || ' '|| b.studlevel|| b.BLOCK)from offeredfor b "+
		"WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as progcode, "+
		"c.slots, c.enrollees FROM schedule a, subject b, offeredsubject c, offeredfor d, employee e "+
		"WHERE a.subjcode=b.subjcode and a.empid=e.empid and a.sy=c.sy and a.sem=c.sem and a.subjcode=c.subjcode and a.section=c.section and c.is_restricted "+
		"and a.sy=d.sy and a.sem=d.sem and a.subjcode=d.subjcode and a.section=d.section and a.sy=$1 and UPPER(a.sem)=UPPER($2) "+
		"and (a.empid like $3 OR UPPER(e.lastname) like UPPER($3)  || '%') "+
		"UNION "+
		"SELECT DISTINCT B.courseno::varchar, a.subjcode::varchar, "+
		"a.section::varchar, a.sy::varchar, a.sem::varchar, (B.description)::varchar, "+
		"(SELECT array(select distinct (b.days || ' ' || to_char(to_timestamp(b.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') || '-' || "+
		"to_char(to_timestamp(b.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')) FROM schedule b "+
		"WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as sched, "+
		"(SELECT array(select distinct b.room FROM schedule b "+
		"WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as room, "+
		"(SELECT array(select distinct b.empid from schedule b "+
		"WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as empid, "+
		"(SELECT array(select distinct initcap(b.lastname || ','|| b.firstname) from employee b "+
		"WHERE b.empid=a.empid))::varchar as instructor, "+
		"'OPEN'::varchar as progcode, "+
		"c.slots, c.enrollees FROM schedule a, subject b, offeredsubject c, employee e "+
		"WHERE a.subjcode=b.subjcode and a.empid=e.empid and a.sy=c.sy and a.sem=c.sem and a.subjcode=c.subjcode and a.section=c.section "+
		"and a.sy=$1 and UPPER(a.sem)=UPPER($2) and NOT c.is_restricted "+
		"and (a.empid like $3 OR UPPER(e.lastname) like UPPER($3)  || '%') ";
			db.query(Query,[sy,sem,instructor],(err,table) =>{
				if(err){
					console.log(err);
				}
				else{
					db.end();
					response.send(table.rows);
				}
			})
		}
	})
	});
	// ****End Category Instructor ****//

	// **** Start Category Room ****//
	router.post('/getCategoryRoom',function(request,response){
		var sy = request.body.sy;
		var sem = request.body.sem;
		var room = request.body.search;
	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = " SELECT DISTINCT B.courseno::varchar, a.subjcode::varchar, "+
     " a.section::varchar, a.sy::varchar, a.sem::varchar, (B.description)::varchar, "+
     " (SELECT array(select distinct (b.days || '' || to_char(to_timestamp(b.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') || ' - ' || "+
     " to_char(to_timestamp(b.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')) FROM schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as sched, "+
     " (SELECT array(select distinct b.room FROM schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as room, "+
     " (SELECT array(select distinct b.empid from schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as empid, "+
     " (SELECT array(select distinct initcap(b.lastname || ', ' || b.firstname) from employee b "+
     " WHERE b.empid=a.empid))::varchar as instructor, "+
     " (SELECT array(select distinct (b.progcode || ' ' || b.studlevel|| b.BLOCK)from offeredfor b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as progcode, "+
     " c.slots, c.enrollees FROM schedule a, subject b, offeredsubject c, offeredfor d, employee e "+
     " WHERE a.subjcode=b.subjcode and a.empid=e.empid and a.sy=c.sy and a.sem=c.sem and a.subjcode=c.subjcode and a.section=c.section and c.is_restricted "+
     " and a.sy=d.sy and a.sem=d.sem and a.subjcode=d.subjcode and a.section=d.section and a.sy=$1 and UPPER(a.sem)=UPPER($2) "+
     " and UPPER(a.room) like UPPER($3) "+
     " UNION "+
     " SELECT DISTINCT B.courseno::varchar, a.subjcode::varchar,  "+
     " a.section::varchar, a.sy::varchar, a.sem::varchar, (B.description)::varchar, "+
     " (SELECT array(select distinct (b.days || ' ' || to_char(to_timestamp(b.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') || ' - ' || "+
     " to_char(to_timestamp(b.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')) FROM schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as sched, "+
     " (SELECT array(select distinct b.room FROM schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as room, "+
     " (SELECT array(select distinct b.empid from schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as empid, "+
     " (SELECT array(select distinct initcap(b.lastname || ', ' || b.firstname) from employee b "+
     " WHERE b.empid=a.empid))::varchar as instructor, "+
     " 'OPEN'::varchar as progcode, "+
     " c.slots, c.enrollees FROM schedule a, subject b, offeredsubject c, employee e "+
     " WHERE a.subjcode=b.subjcode and a.empid=e.empid and a.sy=c.sy and a.sem=c.sem and a.subjcode=c.subjcode and a.section=c.section "+
     " and a.sy=$1and UPPER(a.sem)=UPPER($2) and NOT c.is_restricted "+
     " and UPPER(a.room) like UPPER($3)";
			db.query(Query,[sy,sem,room],(err,table) =>{
				if(err){
					console.log(err);
				}
				else{
					db.end();
					response.send(table.rows);
				}
			})
		}
	})
	});
	// **** End Category Room ****//

	// **** Start Category Course ****//
	router.post('/getCategoryCourse',function(request,response){
		var sy = request.body.sy;
		var sem = request.body.sem;
		var course = request.body.search;
	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = " SELECT DISTINCT B.courseno::varchar, a.subjcode::varchar, "+
    " a.section::varchar, a.sy::varchar, a.sem::varchar, (B.description)::varchar, "+
     " (SELECT array(select distinct (b.days || ' ' || to_char(to_timestamp(b.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') || ' - ' || "+
     " to_char(to_timestamp(b.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')) FROM schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as sched, "+
     " (SELECT array(select distinct b.room FROM schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as room, "+
     " (SELECT array(select distinct b.empid from schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as empid, "+
     " (SELECT array(select distinct initcap(b.lastname || ', ' || b.firstname) from employee b "+
     " WHERE b.empid=a.empid))::varchar as instructor, "+
     " (SELECT array(select distinct (b.progcode || ' ' || b.studlevel|| b.BLOCK)from offeredfor b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as progcode, "+
     " c.slots, c.enrollees FROM schedule a, subject b, offeredsubject c, offeredfor d, employee e "+
     " WHERE a.subjcode=b.subjcode and a.empid=e.empid and a.sy=c.sy and a.sem=c.sem and a.subjcode=c.subjcode and a.section=c.section and c.is_restricted "+
     " and a.sy=d.sy and a.sem=d.sem and a.subjcode=d.subjcode and a.section=d.section and a.sy=$1 and UPPER(a.sem)=UPPER($2) "+
     " and UPPER(b.courseno) like UPPER($3) "+
     " UNION "+
     " SELECT DISTINCT B.courseno::varchar, a.subjcode::varchar, "+
     " a.section::varchar, a.sy::varchar, a.sem::varchar, (B.description)::varchar, "+
     " (SELECT array(select distinct (b.days || ' ' || to_char(to_timestamp(b.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') || ' - ' || "+
     " to_char(to_timestamp(b.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')) FROM schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as sched, "+
     " (SELECT array(select distinct b.room FROM schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as room, "+
     " (SELECT array(select distinct b.empid from schedule b "+
     " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as empid, "+
     " (SELECT array(select distinct initcap(b.lastname || ', ' || b.firstname) from employee b "+
     " WHERE b.empid=a.empid))::varchar as instructor, "+
     " 'OPEN'::varchar as progcode, "+
     " c.slots, c.enrollees FROM schedule a, subject b, offeredsubject c, employee e "+
     " WHERE a.subjcode=b.subjcode and a.empid=e.empid and a.sy=c.sy and a.sem=c.sem and a.subjcode=c.subjcode and a.section=c.section "+
     " and a.sy=$1 and UPPER(a.sem)=UPPER($2) and NOT c.is_restricted "+
     " and UPPER(b.courseno) like UPPER($3)";
			db.query(Query,[sy,sem,course],(err,table) =>{
				if(err){
					console.log(err);
				}
				else{
					db.end();
					response.send(table.rows);
				}
			})
		}
	})
	});
	//**** End Category Course **** //

	//**** Start Get  Courseno **** //
	router.get('/getCourseno', function(req, res) {
	  pool.connect((err,db,done)=>{
	    if(err){
	      console.log(err);
	    }
	    else {
	      db.query('SELECT a.courseno,a.subjcode,a.description,a.lec,a.lab,a.unit from subject a  WHERE a.is_active = true ORDER by a.courseno ASC', (err,table) =>{
	        if(err){
	          console.log(err);
	        }
	        else {
	          db.end();
	          res.send(table.rows);
	        }
	      })
	    }
	  })
	});
	//**** End Get Courseno **** //

	//**** Start Get  Courseno Detail **** //
	router.post('/getCoursenoDetail', function(req, res) {
		var courseno = req.body.courseno;
		var subjcode = req.body.subjcode;

	  pool.connect((err,db,done)=>{
	    if(err){
	      console.log(err);
	    }
	    else {
				var Query = "SELECT a.courseno,a.subjcode,a.description,a.lec,a.lab,a.unit from subject a  WHERE a.courseno = $1 AND a.subjcode = $2";
	      db.query(Query,[courseno,subjcode],(err,table) =>{
	        if(err){
	          console.log(err);
	        }
	        else {
	          db.end();
	          res.send(table.rows);
	        }
	      })
	    }
	  })
	});
	//**** End Get Courseno Detail **** //

	//**** Start Get  Blocking Detail **** //
	router.post('/getBlockingDetail', function(req, res) {
		var subjcode = req.body.subjcode;
		var section = req.body.section;
		var sy = req.body.sy;
		var sem = req.body.sem;

	  pool.connect((err,db,done)=>{
	    if(err){
	      console.log(err);
	    }
	    else {
				var Query = "SELECT * FROM offeredfor WHERE subjcode=$1 AND section=$2 AND sy=$3 AND sem=$4";
	      db.query(Query,[subjcode,section,sy,sem],(err,table) =>{
	        if(err){
	          console.log(err);
	        }
	        else {
	          db.end();
	          res.send(table.rows);
	        }
	      })
	    }
	  })
	});
	//**** End Get Blocking Detail **** //

	//**** Start Get  Schedule Detail **** //
	router.post('/getScheduleDetail', function(req, res) {
		var subjcode = req.body.subjcode;
		var section = req.body.section;
		var sy = req.body.sy;
		var sem = req.body.sem;

	  pool.connect((err,db,done)=>{
	    if(err){
	      console.log(err);
	    }
	    else {
				var Query = "SELECT DISTINCT a.subjcode, a.section, a.sy, a.sem, a.days, " +
   "to_char(to_timestamp(a.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') as fromtime, " +
   "to_char(to_timestamp(a.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') as totime, a.sdate, " +
   "a.room, a.bldg, a.leclab, a.empid, UPPER(b.lastname || ', '::text || b.firstname)::varchar as instructor, c.slots, c.enrollees, c.is_restricted, c.is_requested " +
   "FROM schedule a, offeredsubject c, employee b WHERE a.sy=c.sy and a.sem=c.sem and a.section=c.section and a.subjcode=c.subjcode " +
   "and a.empid=b.empid and a.subjcode=$1 AND a.section=$2 AND a.sy=$3 AND a.sem=$4";
	      db.query(Query,[subjcode,section,sy,sem],(err,table) =>{
	        if(err){
	          console.log(err);
	        }
	        else {
	          db.end();
	          res.send(table.rows);
	        }
	      })
	    }
	  })
	});
	//**** End Get Schedule Detail **** //

	//**** Start Get  NSTP Detail **** //
	router.post('/getNSTPDetail', function(req, res) {
		var subjcode = req.body.subjcode;
		var section = req.body.section;
		var sy = req.body.sy;
		var sem = req.body.sem;

	  pool.connect((err,db,done)=>{
	    if(err){
	      console.log(err);
	    }
	    else {
				var Query = "select * from nstpdetail where sy=$1 and sem=$2 and subjcode = $3 and section=$4";
	      db.query(Query,[sy,sem,subjcode,section],(err,table) =>{
	        if(err){
	          console.log(err);
	        }
	        else {
	          db.end();
	          res.send(table.rows);
	        }
	      })
	    }
	  })
	});
	//**** End Get NSTP Detail **** //

	//**** Start Get Predefined Schedule **** //
	router.get('/getPreSched', function(req, res) {
	  pool.connect((err,db,done)=>{
	    if(err){
	      console.log(err);
	    }
	    else {
				var Query = "SELECT a.days, to_char(to_timestamp(a.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') as fromtime, "+
     								" to_char(to_timestamp(a.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM') as totime, a.section "+
     								" from section a order by a.section asc";
	      db.query(Query, (err,table) =>{
	        if(err){
	          console.log(err);
	        }
	        else {
	          db.end();
	          res.send(table.rows);
	        }
	      })
	    }
	  })
	});
	//**** End Get Predefined Schedule **** //

	//**** Start Get Predefined Schedule **** //
	router.post('/getPreSchedTime', function(req, res) {
		var section = req.body.section;
		pool.connect((err,db,done)=>{
			if(err){
				console.log(err);
			}
			else {
				var Query = "SELECT a.days, a.fromtime,a.totime FROM section a WHERE a.section = $1";
				db.query(Query,[section],(err,table) =>{
					if(err){
						console.log(err);
					}
					else {
						db.end();
						res.send(table.rows);
					}
				})
			}
		})
	});
	//**** End Get Predefined Schedule **** //

	//**** Start Get Instructor **** //
	router.get('/getInstructor', function(req, res) {
	  pool.connect((err,db,done)=>{
	    if(err){
	      console.log(err);
	    }
	    else {
				// (SELECT array(select distinct b.room FROM schedule b "+
	      // " WHERE b.section=a.section and b.sy=a.sy and b.sem=a.sem and b.subjcode=a.subjcode))::varchar as room
				// var Query = "SELECT DISTINCT a.empid, a.lastname ||', '|| a.firstname  || ' '|| a.middlename AS FullName FROM employee a,instructor b WHERE a.empid=b.empid";
				var Query = "WITH usrcol AS ( "+
                  "select colcode from col_encoder where username = 'hbcaringal' "+
                "), cols AS ( "+
                " SELECT DISTINCT colcode FROM college "+
                "), usrgrp AS ( "+
                "SELECT b.groname::varchar as groname, b.grosysid , a.usename FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename='hbcaringal' "+
                "), finlist AS ( "+
                  "SELECT DISTINCT b.colcode "+
                  "FROM usrcol AS a, cols AS b, usrgrp AS c "+
                  "WHERE (CASE WHEN c.groname IN ('suser','registrar') THEN TRUE "+
                    "WHEN b.colcode=a.colcode AND c.groname IN ('coordinator','dept_chair','dean') "+
                    "THEN TRUE "+
                    "ELSE FALSE END) "+
                ") "+
                "SELECT e.empid, UPPER(e.lastname || ', ' || e.firstname || ' ' || substring(e.middlename,1,1))::varchar as instructor "+
                "FROM EMPLOYEE e, instructor i "+
                "WHERE NOT lastname ISNULL AND (i.forall OR i.college in (select colcode from finlist)) AND e.empid=i.empid ORDER BY instructor";
	      db.query(Query, (err,table) =>{
	        if(err){
	          console.log(err);
	        }
	        else {
	          db.end();
	          res.send(table.rows);
	        }
	      })
	    }
	  })
	});
	//**** End Get Predefined Schedule **** //

	// **** Start of Get Effectivity Date Instructor ****//
	router.get('/getEffectivityDate',function(request,response){
		pool.connect((err,db,done)=>{
			if(err){
				console.log(err)
			}
			else{
				var Query = "SELECT startclass FROM sysem ORDER BY sy DESC LIMIT 1";
				db.query(Query,(err,table) =>{
					if(err){
						console.log(err)
					}
					else{
						db.end();
						response.send(table.rows);
					}
				})
			}
		})
	})
	// **** End of Effectivity Date Instructor ****//

	// **** Start of Get Effectivity Date Instructor ****//
	router.post('/checkConflict',function(request,response){
		var days = request.body.days;
		var fromtime = request.body.fromtime;
		var totime = request.body.totime;
		var days2 = request.body.days2;
		var fromtime2 = request.body.fromtime2;
		var totime2 = request.body.totime2;

		pool.connect((err,db,done)=>{
			if(err){
				console.log(err)
			}
			else{
				var Query = "SELECT opt_conflict($1,$2,$3,$4,$5,$6) AS conflict";
				db.query(Query,[days,fromtime,totime,days2,fromtime2,totime2],(err,table) =>{
					if(err){
						console.log(err)
					}
					else{
						db.end();
						response.send(table.rows)
					}
				})
			}
		})
	})
	// **** End of Effectivity Date Instructor ****//

	// **** Start of Program ****//
	router.get('/getProgram',function(request,response){

		pool.connect((err,db,done)=>{
			if(err){
				console.log(err)
			}
			else{
				var Query = "SELECT progcode FROM program WHERE is_active = true ORDER BY progcode ASC";
				db.query(Query,(err,table) =>{
					if(err){
						console.log(err)
					}
					else{
						db.end();
						response.send(table.rows)
					}
				})
			}
		})
	})
	// **** End of Program ****//

	// **** Start of Getting SY and SEM data ****//
	router.get('/getSYSEM',function(request,response){

		pool.connect((err,db,done)=>{
			if(err){
				console.log(err)
			}
			else{
				var Query = "SELECT * FROM sysem ORDER BY sy desc, sem desc LIMIT 1";
				db.query(Query,(err,table) =>{
					if(err){
						console.log(err)
					}
					else{
						db.end();
						response.send(table.rows)
					}
				})
			}
		})
	})
	// **** End of Getting SY and SEM data ****//

	// **** Start of Checking if user has access to subject entry ****//
	router.post('/checkAccess',function(request,response){
		var scode = request.body.scode;
		var sy = request.body.sy;
		var sem = request.body.sem;
		var status = request.body.status;
		pool.connect((err,db,done)=>{
			if(err){
				console.log(err)
			}
			else{
				var Query = "SELECT grantctrl_subjectoffering('janavarro',$1,$2,$3,$4) AS g";
				db.query(Query,[scode,sy,sem,status],(err,table) =>{
					if(err){
						console.log(err)
					}
					else{
						db.end();
						response.send(table.rows)
					}
				})
			}
		})
	})
	// **** End of Checking if user has access to subject entry ****//

	// **** Start of Saving Schedule ****//
	router.post('/saveSchedule',function(request,response){

		var conflict = request.body.conflict;
		var stype = request.body.stype;
		var subjcode = request.body.subjcode;
		var days = request.body.days;
		var fromtime = request.body.fromtime;
		var totime = request.body.totime;
		var instructor = request.body.instructor;
		var room = request.body.room;
		var building = request.body.building;
		var sy = request.body.sy;
		var sem = request.body.sem;
		var slot = request.body.slot;
		var is_requested = request.body.is_requested;
		var is_restricted = request.body.is_restricted;
		var yearlevel = request.body.yearlevel;
		var progcode = request.body.progcode;
		var block = request.body.block;
		var sdate = request.body.sdate;
		var iscwts = request.body.iscwts;
		pool.connect((err,db,done)=>{
			if(err){
				console.log(err)
			}
			else{
				var Query = "SELECT add_newsection($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)";
				db.query(Query,[conflict,subjcode,stype,days,fromtime,totime,instructor,room,building,sy,sem,slot,is_requested,is_restricted,yearlevel,progcode,block,sdate,iscwts],(err,table) =>{
					if(err){
						console.log(err.message)
						response.send({message:err.message})
					}
					else{
						db.end();
						response.send({message:"ok"})
					}
				})
			}
		})
	})
	// **** End of Saving Schedule ****//

	// **** Start of Updating Schedule ****//
	router.post('/updateSchedule',function(request,response){

		var conflict = request.body.conflict;
		var prevsection = request.body.prevsection;
		var prevsectioning = request.body.prevsectioning;
		var stype = request.body.stype;
		var subjcode = request.body.subjcode;
		var days = request.body.days;
		var fromtime = request.body.fromtime;
		var totime = request.body.totime;
		var instructor = request.body.instructor;
		var room = request.body.room;
		var building = request.body.building;
		var sy = request.body.sy;
		var sem = request.body.sem;
		var slot = request.body.slot;
		var is_requested = request.body.is_requested;
		var is_restricted = request.body.is_restricted;
		var yearlevel = request.body.yearlevel;
		var progcode = request.body.progcode;
		var block = request.body.block;
		var sdate = request.body.sdate;
		var iscwts = request.body.iscwts;
		pool.connect((err,db,done)=>{
			if(err){
				console.log(err)
			}
			else{
				var Query = "SELECT update_section($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)";
				db.query(Query,[conflict,prevsection,prevsectioning,subjcode,stype,days,fromtime,totime,instructor,room,building,sy,sem,slot,is_requested,is_restricted,yearlevel,progcode,block,sdate,iscwts],(err,table) =>{
					if(err){
						console.log(err.message)
						response.send({message:err.message})
					}
					else{
						db.end();
						response.send({message:"ok"})
					}
				})
			}
		})
	})
	// **** End of Updating Schedule ****//

	// **** Start of getting class list ****//
	router.post('/getClassList',function(request,response){
		var sy = request.body.sy;
		var sem = request.body.sem;
		var scode = request.body.scode;
		var section = request.body.section;
		pool.connect((err,db,done)=>{
			if(err){
				console.log(err)
			}
			else{
				var Query = " SELECT DISTINCT student.studid,(initcap(Student.LastName||', '||student.firstname||' '||' '||substring(student.middlename from 1 for 1)||'.'))::varchar as student,semstudent.studmajor,program.progdesc,semstudent.sy,semstudent.sem, "+
                " subject.courseno,registration.section, "+
								" CASE "+
								"	WHEN semstudent.studlevel=1 THEN '1st' "+
								"	WHEN semstudent.studlevel=2 THEN '2nd' "+
								"	WHEN semstudent.studlevel=3 THEN '3rd' "+
								"	WHEN semstudent.studlevel=4 THEN '4th' "+
								"	WHEN semstudent.studlevel=5 THEN '5th' "+
								"	ELSE 'Undefined' "+
								"	END AS studlevel "+
								" FROM student,semstudent,program,subject,offeredsubject,registration,schedule,employee "+
								" WHERE student.studid=semstudent.studid AND semstudent.studmajor=program.progcode "+
								                " and semstudent.sy=registration.sy "+
								                " and semstudent.sem=registration.sem "+
								                " and semstudent.studid=registration.studid "+
								                " and subject.subjcode=offeredSubject.subjcode "+
								       	" and offeredSubject.subjcode=registration.subjcode "+
								                " and offeredsubject.subjcode=subject.subjcode "+
								                " and offeredSubject.section=registration.section "+
								      	" and offeredSubject.sy=registration.sy "+
								      	" and offeredSubject.sem=registration.sem "+
									" and schedule.subjcode=offeredsubject.subjcode "+
									" and schedule.section=offeredsubject.section "+
									" and schedule.sy=offeredsubject.sy "+
									" and schedule.sem=offeredsubject.sem "+
								                " and employee.empid=schedule.empid "+
									" AND semstudent.sy=$1 AND semstudent.sem=$2 AND subject.subjcode=$3 AND offeredsubject.section=$4 "+
								" ORDER BY student ";
				db.query(Query,[sy,sem,scode,section],(err,table) =>{
					if(err){
						console.log(err)
					}
					else{
						db.end();
						response.send(table.rows)
					}
				})
			}
		})
	})
	// **** End of getting class list ****//

	// **** Start of getting subject detail ****//
	router.post('/getSubjectDetail',function(request,response){
		var sy = request.body.sy;
		var sem = request.body.sem;
		var subjcode = request.body.subjcode;
		var section = request.body.section;
		pool.connect((err,db,done)=>{
			if(err){
				console.log(err)
			}
			else{
				var Query = "SELECT * FROM offeredsubject WHERE subjcode=$1 AND section=$2 AND sy=$3 AND sem=$4";
				db.query(Query,[subjcode,section,sy,sem],(err,table) =>{
					if(err){
						console.log(err)
					}
					else{
						db.end();
						response.send(table.rows)
					}
				})
			}
		})
	})
	// **** End of getting offered subject detail  ****//

//***************************
//END Scheduling Module *****
//***************************


/*/********************
//* Enrolment Module *
//********************/
router.post('/enrolmentGrantControl',function(request,response){
	var uid = request.body.uid;
	var result = [];
  pool.connect((err,db,done) =>{
    if(err){
      return response.status(400).send(err);
    }else{
			var query = "SELECT grantctrl_prevenrolment($1) AS g";
      db.query(query, [uid], (err,table) => {
        if(err){
					console.log(err);
					console.log("message: error");
        }else{
							if(table.rows.length > 0){
								if(table.rows[0].g){
									result.push({g:"true"});
								}else{
									result.push({g:"false"});
								}
							}else{
								result.push({g:""});
							}

							var query = "SELECT b.groname::varchar, b.grosysid , a.usename "+
										      " FROM pg_user a , pg_group b                             "+
										      " WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1";
				      db.query(query, [uid], (err,table) => {
				        if(err){
									console.log(err);
									console.log("message: error");
				        }else{
											if(table.rows.length > 0){
												result.push({grpname: table.rows});
											}

											var query = "SELECT b.groname, b.grosysid , a.usename FROM pg_user a , pg_group b "+
      														" WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1  AND b.groname='dean' ";
								      db.query(query, [uid], (err,table) => {
								        if(err){
													console.log(err);
													console.log("message: error");
								        }else{
															if(table.rows.length > 0 || uid ==='postgres'){
																result.push({is_dean:"True",maxload_readOnly:"False"});
															}else{
																result.push({is_dean:"False",maxload_readOnly:"True"});
															}

															db.end();
															response.send(result);
								        }
								      })
				        }
				      })
        }
      })
    }
  })
});

router.post('/getIDSearchCategory',function(request,response){
	var search = request.query.search;
  pool.connect((err,db,done) =>{
    if(err){
      return response.status(400).send(err);
    }else{
			var que = "SELECT studid as idno,studid,lastname,firstname,middlename, " +
			" (lastname||', '||firstname||' '||middlename)::varchar as name " +
			"FROM student where studid=$1";
      db.query(que, [search], (err,table) => {
        if(err){
					console.log(err);
					console.log("message: error");
        }else{
					db.end();
					response.send(table.rows);
          // console.log("Data searched");
					// console.log(search);
          // response.status(201).send({message:'Data searched'});
        }
      })
    }
  })
});
router.post('/getLastNameSearchCategory',function(request,response){
	var search = request.query.search;

  pool.connect((err,db,done) =>{
    if(err){
      return response.status(400).send(err);
			console.log("dri");
    }else{
			var que = "SELECT studid as idno,studid,lastname,firstname,middlename, " +
			" (lastname||', '||firstname||' '||middlename)::varchar as name " +
			"FROM student where lastname ilike $1 "+
			"order by lastname,firstname,middlename";
      db.query(que, [search], (err,table) => {
        if(err){
          return response.status(400).send(err);
					console.log(err);
					console.log("message: error");
        }else{
					db.end();
					response.send(table.rows);
          console.log('Data searched');
          response.status(201).send({message:'Data searched'});
        }
      })
    }
  })
});
router.post('/getFirstNameSearchCategory',function(request,response){
	var search = request.query.search;

  pool.connect((err,db,done) =>{
    if(err){
      return response.status(400).send(err);
			console.log("dri");
    }else{
			var que = "SELECT studid as idno,studid,lastname,firstname,middlename, " +
			" (lastname||', '||firstname||' '||middlename)::varchar as name " +
			"FROM student where firstname ilike $1 "+
			"order by firstname,lastname,middlename";
      db.query(que, [search], (err,table) => {
        if(err){
          return response.status(400).send(err);
					console.log(err);
					console.log("message: error");
        }else{
					db.end();
					response.send(table.rows);
          // response.status(201).send({message:'Data searched'});
        }
      })
    }
  })
});

//** GET school year **//
router.get('/sysem', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
			// db.query("SELECT * from sysem where sy='2016-2017' and sem='2nd' ORDER BY sy,sem ASC", (err,table) =>{
      db.query('SELECT distinct sy,sem from sysem ORDER BY sy,sem ASC', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
//** End of getting school year **//

//** GET students from previous sem **//
router.get('/semStudents', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT * from semstudent', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
//** End of getting students from previous sem **//

//** GET scholars' details **//
router.get('/scholar', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT * from scholar', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
//** End of getting scholars **//

//** GET scholarship details **//
router.get('/scholarsDetail', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT * from scholarsdetail', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
//** End of getting scholarchip **//

//** GET program limit details only progcode,progdesc **//
router.get('/programLimitDetail', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT progcode,progdesc,college from program WHERE is_active = true ORDER BY progcode ASC', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
//** End of getting program details **//

//** GET curriculum details **//
router.get('/curriculum', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT progcode,yearcreated from curriculum order by yearcreated ASC', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
//** End of getting curriculum **//

//**Get studenttag details**//
router.get('/getfromStudenttag', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT * from studenttag', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
//** End of getting studenttag **//

//**** Get data in table status ***//
router.get('/getStatus', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT statusdesc FROM status WHERE isactive ORDER BY statusdesc', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
//*** End of getting data in status***//

//**** Check registration data***//
router.post('/checkRegistration', function(request, response) {
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;

  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT studid,sy,sem,datevalidated FROM registration WHERE studid=$1 and sy=$2 and sem=$3',[studid,sy,sem], (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
					if(table.rows.length > 0){
						if(table.rows[0].datevalidated === null ){
							db.end();
							response.send({message:"Student is not yet validated!",isValidated: false});
						}else{
							db.end();
							response.send({message:"Student already validated!",isValidated: true});
						}
					}else{
						db.end();
						response.send({message:"No registration record found!", isValidated: false});
					}

        }
      })
    }
  })
});
//*** End of getting data in registration ***//

//**Get studenttag details**//
router.post('/getBlocks',function(request,response){
	var progcode = request.body.progcode;
	var sy = request.body.sy;
	var sem = request.body.sem;

	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "Select distinct block  from offeredfor where progcode=$1 and sy=$2 and sem=$3 order by block desc";

			db.query(Query,[progcode,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}else{
					db.end();
					response.send(table.rows);
				}
			})
		}
	})
});
//** End of getting studenttag **//

//*** Get student's max load ***//
router.post('/getMaxload',function(request,response){
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;

	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT maxload_d7($1,$2,$3) as maxload";

			db.query(Query,[studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}else{
					var result =table.rows;
					var Query1 = "SELECT cur_scholastic_status($1) as status";

					db.query(Query1,[studid],(err,table) =>{
						if(err){
							console.log(err);
						}else{
							result.push(table.rows);
							console.log(result);
							db.end();
							response.send(result);
						}
					})
				}
			})
		}
	})
});
//*** END of getting student's maxload ***//

//** Get student data from prior sem **//

router.post('/whenNotFoundinStudenttag',function(request,response){
	var studid = request.body.studid;
	var sem = request.body.sem;
	var sy = request.body.sy;
	var uid = request.body.uid;
	var istagged = request.body.istagged;

	var result =[];
console.log(studid,sem,sy,uid,istagged);
	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT * FROM semstudent s, (SELECT * FROM sysem WHERE sy||sem < $3||$2) AS y "+
			       		" WHERE s.sy=y.sy AND s.sem=y.sem AND studid=$1 ORDER BY s.sy DESC, s.sem DESC LIMIT 1";

			db.query(Query,[studid,sem,sy],(err,table) =>{
				if(err){
					console.log(err);
				}
				else{
					//*** Check the latest prior sems without DRP ALL grades **//
					console.log("kini lage");
					if(table.rows.length > 0){
						var Query2 = " SELECT s.sy, s.sem, s.studid, s.studmajor, s.cur_year, count(r.subjcode) as subjcnt "+
						         " FROM semstudent s, (SELECT * FROM sysem WHERE sy||sem<$3||$2) AS y, registration r, subject j "+
						         " WHERE s.sy=y.sy AND s.sem=y.sem AND s.studid=r.studid AND s.sy=r.sy AND s.sem=r.sem AND j.subjcode=r.subjcode "+
						         " AND s.studid=$1 AND NOT (r.subjcode ilike 'NSTP%' or r.subjcode ilike 'MS %') AND NOT description ilike '%military%' "+
						         " GROUP BY s.sy, s.sem, s.studid, s.studmajor, s.cur_year HAVING SUM(case when grade='DRP' or grade isnull then 0 else 1 end) > 0 "+
						        " ORDER BY s.sy desc, s.sem DESC LIMIT 1";

						db.query(Query2,[studid,sem,sy],(err,table) =>{
							if(err){
								console.log(err);
							}
							else{
								if(table.rows.length > 0){
									result.push({priorsemdata: table.rows});
									//*** Get Scholastic standing
									var Query3 = "SELECT scholastic_status($1,$2,$3) AS standing";

									db.query(Query3,[studid,sem,sy],(err,table) =>{
										if(err){
											console.log(err);
										}else{
												console.log("scholastic status");
												if(table.rows.length > 0){
													result.push({schocstat:table.rows});
												}

												var Query4 = "SELECT gpa($1,$3,$2) AS gpa";

												db.query(Query4,[studid,sem,sy],(err,table) =>{
													if(err){
														console.log(err);
													}
													else{
															if(table.rows.length > 0){
																result.push({gpa: table.rows});
															}else{
																result.push({gpa: 0});
															}
															var Query = "SELECT DISTINCT b.ugrp, b.grant as g FROM (SELECT b.groname::varchar as ugrp, "+
																					" true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('registrar','suser','guidance')) as b  "+
																					" UNION SELECT DISTINCT b.ugrp, b.grant as g FROM studsubj_controller sc  "+
																					" , (SELECT a.usename, b.groname::varchar as ugrp, true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('adviser','dean')) as b  "+
																					" , (SELECT * FROM program WHERE progcode=$2) as c  "+
																					" WHERE sc.username=b.usename and (CASE WHEN false=$3 THEN (CASE WHEN c.college!='GS' THEN c.progdept=sc.deptcode and c.college=sc.colcode	ELSE c.college=sc.colcode END) ELSE true END)";

															db.query(Query,[uid,studmajor,istagged],(err,table) =>{
																if(err){
																	console.log(err);
																}
																else{
																	if(table.rows.length > 0){
																		if(table.rows[0].g){
																			let enable_prog_grp = true;
																			result.push({message:"Allowed to advise for student registration", enable_prog_grp: true});
																		}else{
																			result.push({message:"Allowed advise for student registration", enable_prog_grp:false});
																		}
																	}

																		var Query = "SELECT DISTINCT b.ugrp, b.grant as g FROM (SELECT b.groname::varchar as ugrp, "+
																								" true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('registrar','suser')) as b  "+
																								" UNION SELECT DISTINCT b.ugrp, b.grant as g FROM studsubj_controller sc  "+
																								" , (SELECT a.usename, b.groname::varchar as ugrp, true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('stud_course_enc','dean')) as b  "+
																								" , (SELECT * FROM program WHERE progcode=$2) as c  "+
																								" WHERE sc.username=b.usename and (CASE WHEN false=$3 THEN (CASE WHEN c.college!='GS' THEN c.progdept=sc.deptcode and c.college=sc.colcode	ELSE c.college=sc.colcode END) ELSE true END) ";

																		db.query(Query,[uid,studmajor,istagged],(err,table) =>{
																			if(err){
																				console.log(err);
																			}
																			else{
																				if(table.rows.length > 0){
																					if(table.rows[0].g){
																						let enable_prog_grp = true;
																						result.push({message:"An advise for student registration", enable_prog_grp: true});
																					}else{
																						result.push({message:"An advise for student registration", enable_prog_grp: false});
																					}
																				}
																			}
																		})
																}
															})
													}
												})
										}
									})
								}
							}
						})
						var query = "SELECT DISTINCT b.ugrp, b.grant as g FROM (SELECT b.groname::varchar as ugrp, "+
												"	true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('registrar','suser','guidance')) as b  "+
												"		UNION SELECT DISTINCT b.ugrp, b.grant as g FROM studsubj_controller sc  "+
												"		,(SELECT b.groname::varchar as ugrp, true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('adviser','dean')) as b  "+
												"		WHERE sc.username=$1";

						db.query(query,[uid],(err,table) =>{
							if(err){
								console.log(err);
							}
							else{
								result.push({usergrant: table.rows});
								db.end();
								response.send(result);
							}
						})
					}else{
						var Query = "SELECT DISTINCT b.ugrp, b.grant as g FROM (SELECT b.groname::varchar as ugrp,  "+
												" true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('registrar','suser','guidance')) as b  "+
												" UNION SELECT DISTINCT b.ugrp, b.grant as g FROM studsubj_controller sc  "+
												" ,(SELECT b.groname::varchar as ugrp, true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('adviser','dean')) as b  "+
												" WHERE sc.username=$1 and $2";
						db.query(Query,[uid,istagged],(err,table) =>{
							if(err){
								console.log(err);
							}
							else{
								if(table.rows.length > 0){
									if(table.rows[0].g){
										result.push({enable_prog_grp: true});
									}else{
										result.push({enable_prog_grp: false});
									}
								}
								var Query = "SELECT DISTINCT b.ugrp, b.grant as g FROM (SELECT b.groname::varchar as ugrp, "+
													  " true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('registrar','suser')) as b "+
													  " UNION SELECT DISTINCT b.ugrp, b.grant as g FROM studsubj_controller sc "+
													  " ,(SELECT b.groname::varchar as ugrp, true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('stud_course_enc','dean')) as b "+
													  " WHERE sc.username=$1 and $2";
								db.query(Query,[uid,istagged],(err,table) =>{
									if(err){
										console.log(err);
									}
									else{
										if(table.rows.length > 0){
											if(table.rows[0].g){
												result.push({enable_course_grp: true});
											}else{
												result.push({enable_course_grp: false});
											}
										}
										db.end();
										response.send(result);
									}
								})
							}
						})
					}
				}
			})
		}
	})
});
//** End of getting student data from prior sem **//

//*** Check grant to user logged if registrar **//
router.post('/checkGrantRegistrar',function(request,response){
	var uid = request.body.uid;

	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT b.groname, b.grosysid , a.usename FROM pg_user a , pg_group b "+
      						" WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1  AND b.groname='registrar' ";
			db.query(Query,[uid],(err,table) =>{
				if(err){
					console.log(err);
				}
				else{
						if(table.rows.length > 0){
							db.end();
							response.send({registrar: true});
						}else{
							db.end();
							response.send({registrar: false});
						}
				}
			})
		}
	})
});
//** End of checking grant to user logged in if registrar **//

//*** Check grant to user logged if registrar or super user**//
router.post('/checkGrantFRegistrarSuperuser',function(request,response){
	var uid = request.body.uid;

	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT b.groname::varchar as ugrp FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('registrar','suser') ";
			db.query(Query,[uid],(err,table) =>{
				if(err){
					console.log(err);
				}
				else{
						if(table.rows.length > 0){
							db.end();
							response.send({registrarsuser: true});
						}else{
							db.end();
							response.send({registrarsuser: false});
						}
				}
			})
		}
	})
});
//** End of checking grant to user logged in if registrar or super user**//

//*** Check grant to user logged in **//
router.post('/checkGrantReg',function(request,response){
	var uid = request.body.uid;
	var studmajor = request.body.studmajor;
	var result =[];

	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT DISTINCT b.ugrp, b.grant as g FROM (SELECT b.groname::varchar as ugrp, "+
									 " true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('registrar','suser','guidance')) as b  "+
									 " UNION SELECT DISTINCT b.ugrp, b.grant as g FROM studsubj_controller sc  "+
									 " ,(SELECT a.usename, b.groname::varchar as ugrp, true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename='mmortuyo' AND groname IN ('adviser','dean')) as b  "+
									 " , (SELECT * FROM program WHERE progcode=$2) as c  "+
									 " WHERE sc.username=b.usename and (CASE WHEN c.college!='GS' THEN c.progdept=sc.deptcode and c.college=sc.colcode ELSE c.college=sc.colcode END) ";
			db.query(Query,[uid,studmajor],(err,table) =>{
				if(err){
					console.log(err);
				}
				else{
						if(table.rows.length > 0){
							result.push({message:"Can edit studinfo",enable_prog_grp: true});
						}else{
							result.push({message:"Cannot edit studinfo",enable_prog_grp: false});
						}
						var Query = "SELECT DISTINCT b.ugrp, b.grant as g FROM (SELECT b.groname::varchar as ugrp, "+
												" true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename='mmortuyo' AND groname IN ('registrar','suser')) as b  "+
												" UNION SELECT DISTINCT b.ugrp, b.grant as g FROM studsubj_controller sc  "+
												" ,(SELECT a.usename, b.groname::varchar as ugrp, true as grant FROM pg_user a , pg_group b WHERE a.usesysid = ANY (b.grolist) AND a.usename=$1 AND groname IN ('stud_course_enc','dean')) as b  "+
												" , (SELECT * FROM program WHERE progcode=$2) as c "+
												" WHERE sc.username=b.usename and (CASE WHEN c.college!='GS' THEN c.progdept=sc.deptcode and c.college=sc.colcode ELSE c.college=sc.colcode END) ";
						db.query(Query,[uid,studmajor],(err,table) =>{
							if(err){
								console.log(err);
							}
							else{
									if(table.rows.length > 0){
										result.push({message2:"Can add student courses",enable_course_grp: true});
										db.end();
										response.send(result);
									}else{
										result.push({message2:"Cannot add student courses",enable_course_grp: false});
										db.end();
										response.send(result);
									}
							}
						})
				}
			})
		}
	})
});
//** End of checking grant to user logged in **//


//**If student is not ELEM or HS **//
router.post('/evalIfNotELEMHS',function(request,response){
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;
	var result = [];

	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT distinct REGISTRATION.StudID, REGISTRATION.subjcode, REGISTRATION.section, REGISTRATION.SY, REGISTRATION.Sem, Schedule.days, Schedule.fromtime, Schedule.totime, " +
              "SUBJECT.courseno,Schedule.fromtime,(to_char(to_timestamp(schedule.fromtime::text,'HH24:MI'),'HH12:MI AM')||'-'||to_char(to_timestamp(schedule.totime::text,'HH24:MI'),'HH12:MI AM'))::varchar as skedtime "+
              " ,subject.description::varchar as description, subject.lab, subject.lec, subject.unit, OfferedSubject.is_requested, REGISTRATION.datevalidated "+
							" FROM SUBJECT INNER JOIN ((OfferedSubject INNER JOIN Schedule ON (OfferedSubject.Sem = Schedule.Sem) AND (OfferedSubject.SY = Schedule.SY) AND (OfferedSubject.section = Schedule.section) AND (OfferedSubject.subjcode = Schedule.subjcode)) "+
							" INNER JOIN REGISTRATION ON (OfferedSubject.Sem = REGISTRATION.Sem) AND (OfferedSubject.SY = REGISTRATION.SY) AND (OfferedSubject.section = REGISTRATION.section) AND (OfferedSubject.subjcode = REGISTRATION.subjcode)) ON SUBJECT.subjcode = OfferedSubject.subjcode "+
							" WHERE REGISTRATION.StudID=$1 AND REGISTRATION.SY=$2 AND REGISTRATION.Sem=$3 "+
							" ORDER BY courseno ";

			db.query(Query,[studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}else{
					if(table.rows.length > 0){
						result.push(table.rows.map(obj => obj.subjcode));
						var Query1 = "SELECT sum(unit) as load from " +
													" (SELECT subjcode, unit FROM (  " +
													" SELECT distinct R.subjcode,subject.unit  " +
														" , (select d.grade from registration d where d.subjcode=r.subjcode and d.studid=r.studid and not(d.sy=r.sy and d.sem ilike r.sem) order by d.sy desc, d.sem desc limit 1) AS GR  " +
														" FROM subject,registration R " +
														" WHERE subject.subjcode=R.subjcode  " +
														"  and not(R.subjcode like 'NSTP%' OR R.subjcode like 'MS %' OR R.subjcode like 'ENGL R%'  OR R.subjcode like 'MATH R%') " +
														"  and studid=$1 and sy=$2 and sem=$3) AS A " +
														" WHERE (not GR IN ('IN PROG', 'IN PROGRESS')) OR GR ISNULL " +
														" UNION " +
													  " SELECT distinct registration.subjcode,subject.lec as unit " +
														" FROM subject,registration " +
														" WHERE subject.subjcode=registration.subjcode and (registration.subjcode like 'ENGL R%' OR registration.subjcode like 'MATH R%') " +
														"	and studid=$1 and sy=$2 and sem=$3) as qry";
						db.query(Query,[studid,sy,sem],(err,table) =>{
							if(err){
								console.log(err);
							}else{
									result.push(table.rows);
									//console.log(result);
									db.end();
									response.send({result,message:"Student has enrolled courses already."});
							}
						})
					}else{
						db.end();
						response.send({message: "No enrolled courses yet!"})
					}
				}
			})
		}
	})
})
//**END of If student is not ELEM or HS **//

//***Offered courses to given student data **//
router.post('/checkOfferingToStudent', function(request, response) {
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;
	var progcode = request.body.progcode;
	var year = request.body.year;

	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = "SELECT DISTINCT offeredsubject.subjcode,subject.courseno "+
									"	FROM offeredsubject,subject "+
									"	WHERE sy=$2 AND sem=$3 AND subject.subjcode=offeredsubject.subjcode AND subject.is_active "+
									"	AND NOT (UPPER(offeredsubject.subjcode)=UPPER('flexi') OR UPPER(offeredsubject.subjcode)=UPPER('CONSULTATION')) "+
									"	EXCEPT "+
									"	SELECT p.subjcode, s.courseno FROM subject s, prereqsubj p LEFT JOIN (SELECT * FROM registration WHERE (is_pass(grade) or (grade='INC' and is_pass(gcompl))) AND studid=$1) r ON(p.requisite=r.subjcode) "+
									"	WHERE s.subjcode=p.subjcode "+
									"	AND p.progcode=(CASE WHEN $4 like '%-G' THEN (CASE WHEN $4='ASOCMATSCI-G' THEN 'ASSOC MATSCI' ELSE $4 END) ELSE $4 END) "+
									"	AND p.yearcreated=$5 AND (r.subjcode isnull ) "+
									"	EXCEPT "+
									"	SELECT r.subjcode, s.courseno FROM registration r, subject s, semstudent t, program p "+
									"	WHERE r.studid=$1 AND s.subjcode=r.subjcode AND r.studid=t.studid AND r.sy=t.sy AND r.sem=t.sem AND t.studmajor=p.progcode "+
									"	AND (CASE WHEN p.undergrad THEN (is_pass(grade) OR (grade='INC' AND is_pass(gcompl))) "+
									"	WHEN p.masteral THEN (grade<='2.00' OR (grade='INC' AND grade<='2.00')) "+
									" WHEN p.phd THEN (grade<='1.75' OR (grade='INC' AND grade<='1.75')) "+
									"	ELSE FALSE END) "+
								  " ORDER BY subjcode";
			db.query(Query,[studid,sy,sem,progcode,year],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
					db.end();
					response.send(table.rows);
				}
			})
		}
	})
});
//***END Offered courses to given student data **//

//*** Check Clearnce ***//
router.post('/checkClearance', function(request, response) {
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;
	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = "SELECT * FROM clearance.studentclearances WHERE studid=$1 AND datecleared ISNULL AND (schoolyear||semester)<($2||$3)";
			db.query(Query,[studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
					if(table.rows.length > 0){
						db.end();
						response.send({message: 'Sorry student cannot proceed enrollment. Student has uncleared clearance.',cleared:'false'});
					}else{
						db.end();
						response.send({message: 'All accounts are settled', cleared:'true'});
					}
				}
			})
		}
	})
});
//** End of Checking Clearance **//

//**** Check Student payment ***//
router.post('/checkStudentPayment', function(request, response) {
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;

	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = "Select pays.ornumber,pays.amount from receipt,pays "+
								  "where receipt.idno=$1 and receipt.student=true and receipt.sy=$2 and receipt.sem=$3 "+
								  "  and receipt.ornumber=pays.ornumber and pays.ascode=18 and not(pays.amount=0.00::numeric(10,2))";
			db.query(Query,[studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
						db.end();
						response.send(table.rows);
				}
			})
		}
	})
});
//**** End of checking student payment ***//

//**** Check for offered courses to student ***//
router.post('/checkOfferedtoStudent', function(request, response) {
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;
	var block = request.body.block;
	var progcode = request.body.progcode;
	var year = request.body.year;

console.log(block);
	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = "SELECT distinct REGISTRATION.StudID, REGISTRATION.subjcode, REGISTRATION.section, REGISTRATION.SY, REGISTRATION.Sem, Schedule.days, Schedule.fromtime, Schedule.totime, "+
                  " SUBJECT.courseno,Schedule.fromtime,(to_char(to_timestamp(schedule.fromtime::text,'HH24:MI'),'HH12:MI AM')||'-'||to_char(to_timestamp(schedule.totime::text,'HH24:MI'),'HH12:MI AM'))::varchar as skedtime "+
                  " ,subject.description::varchar as description, subject.lab, subject.lec, subject.unit, OfferedSubject.is_requested, REGISTRATION.datevalidated "+
                  " FROM SUBJECT INNER JOIN ((OfferedSubject INNER JOIN Schedule ON (OfferedSubject.Sem = Schedule.Sem) AND (OfferedSubject.SY = Schedule.SY) AND (OfferedSubject.section = Schedule.section) AND (OfferedSubject.subjcode = Schedule.subjcode)) "+
                  " INNER JOIN REGISTRATION ON (OfferedSubject.Sem = REGISTRATION.Sem) AND (OfferedSubject.SY = REGISTRATION.SY) AND (OfferedSubject.section = REGISTRATION.section) AND (OfferedSubject.subjcode = REGISTRATION.subjcode)) ON SUBJECT.subjcode = OfferedSubject.subjcode "+
                  " WHERE REGISTRATION.StudID=$1 AND REGISTRATION.SY=$2 AND REGISTRATION.Sem=$3 ORDER BY courseno";
			db.query(Query,[studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
					if(table.rows.length === 0 && block !== ''){
								var Query1 = "SELECT distinct $6,subjcode,section,sy,sem FROM offeredfor "+
											" WHERE sy=$1 and sem=$2 and  $4 ilike progcode||'%' and block=$3 and studlevel=$5";
								db.query(Query1,[sy,sem,block,progcode,year,studid],(err,table) =>{
									if(err){
										console.log(err);
									}
									else {
										if(table.rows.length > 0){	// individually insert each course in the block except those taken and passed already
											var Query2= " INSERT INTO registration(studid,subjcode,section,sy,sem) "+
																	" SELECT distinct $6,o.subjcode,section,$1,$2 FROM offeredfor o, "+
																	" (SELECT subjcode FROM offeredfor WHERE sy=$1 and sem=$2 and $4 ilike progcode " +
																	" and block=$3 and studlevel=$5 EXCEPT "+
																	" SELECT subjcode FROM registration WHERE studid=$6 and (is_pass(grade) OR (grade='INC' and is_pass(gcompl)))) as p "+
																	" WHERE o.subjcode=p.subjcode and sy=$1 and sem=$2 and $4 ilike progcode and block=$3 and studlevel=$5";
											db.query(Query2,[sy,sem,block,progcode,year,studid],(err,table) =>{
												if(err){
													console.log(err);
												}
												else {
													console.log("Data inserted!");
													var Query3= " SELECT distinct $6,subjcode,section,$1,$2 FROM offeredfor "+
																" WHERE sy=$1 and sem=$2 and $4 ilike progcode||'%' and block=$3 and studlevel=$5 LIMIT 1 ";
													db.query(Query3,[sy,sem,block,progcode,year,studid],(err,table) =>{
														if(err){
															console.log(err);
														}
														else {
																var subjcode = table.rows[0].subjcode;
																var Query4= " SELECT DISTINCT * FROM "+
																					" (SELECT DISTINCT SUBJECT.courseno, OfferedSubject.subjcode, OfferedSubject.section, OfferedSubject.SY, OfferedSubject.Sem, "+
																					" (to_char(to_timestamp(Schedule.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')|| '-' ||to_char(to_timestamp(Schedule.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM'))::varchar as skedtime, "+
																					" Schedule.days,OfferedSubject.Slots as quota,(OfferedSubject.Slots-OfferedSubject.Enrollees)::int2 as slots,subject.unit, "+
																					" OfferedSubject.is_restricted,(CASE WHEN OfferedSubject.is_reQUESTED THEN 'REQ' ELSE 'REG' END)::VARCHAR AS OFFERING, "+
																					" subject.description::varchar as description, subject.lab, subject.lec, subject.unit "+
																					" FROM subject,offeredsubject,schedule,offeredFor "+
																					" WHERE subject.subjcode=offeredsubject.subjcode and offeredsubject.subjcode=schedule.subjcode and offeredsubject.section=schedule.section and offeredsubject.sy=schedule.sy and offeredsubject.sem=schedule.sem "+
																					" AND  offeredsubject.subjcode=offeredFor.subjcode and offeredsubject.section=offeredFor.section and offeredsubject.sy=offeredFor.sy and offeredsubject.sem=offeredFor.sem "+
																					" AND  (OfferedSubject.Slots-OfferedSubject.Enrollees)>0 "+
																					" AND  OfferedSubject.SY=$1 AND OfferedSubject.Sem=$2 AND OfferedSubject.subjcode=$4 "+
																					"  AND (OfferedSubject.is_restricted=false OR (OfferedSubject.is_restricted AND offeredFor.progcode=$3 )) "+
																					" UNION "+
																					" SELECT DISTINCT SUBJECT.courseno, OfferedSubject.subjcode, OfferedSubject.section, OfferedSubject.SY, OfferedSubject.Sem,  "+
																					" (to_char(to_timestamp(Schedule.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')|| '-' ||to_char(to_timestamp(Schedule.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM'))::varchar as skedtime, "+
																					" Schedule.days,OfferedSubject.Slots as quota,(OfferedSubject.Slots-OfferedSubject.Enrollees)::int2 as slots,subject.unit, "+
																					" OfferedSubject.is_restricted,(CASE WHEN OfferedSubject.is_reQUESTED THEN 'REQ' ELSE 'REG' END)::VARCHAR AS OFFERING, "+
																					" subject.description::varchar as description, subject.lab, subject.lec, subject.unit "+
																					" FROM subject,offeredsubject,schedule "+
																					" WHERE subject.subjcode=offeredsubject.subjcode and offeredsubject.subjcode=schedule.subjcode and offeredsubject.section=schedule.section and offeredsubject.sy=schedule.sy and offeredsubject.sem=schedule.sem "+
																					" AND  (OfferedSubject.Slots-OfferedSubject.Enrollees)>0 "+
																					"  AND  OfferedSubject.SY=$1 AND OfferedSubject.Sem=$2 AND OfferedSubject.subjcode=$4 "+
																					"  AND OfferedSubject.is_restricted=false) as qry";
																db.query(Query4,[sy,sem,progcode,subjcode],(err,table) =>{
																	if(err){
																		console.log(err);
																	}
																	else {
																		var result = table.rows;
																		db.end();
																		response.send({result,message: "OK"});
																	}
																})
														}
													})
												}
											})
										}else{
											db.end();
											response.send({message: "No assigned course offering for the given BLOCK."});
										}
									}
								})
						}else{
							db.end();
							response.send({message:"Registration record has been found!"});
						}
				}
				})
			}
			})
 });
//**** End of checking offered courses to student ***//

//**** Enroll student, insert/update semstudent ***//
router.post('/InsertUpdateEnrollStudent', function(request, response) {
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;
	var studmajor = request.body.major;
	var regdate = request.body.regdate;
	var gpa = parseFloat(request.body.gpa);
	var scholarcode = request.body.scholarcode;
	var studlevel = request.body.year;
	var cur_year = request.body.cur_year;
	var status = request.body.status;
	var maxload = parseFloat(request.body.maxload);
	var block = request.body.block;
	var scholastic_stat = request.body.scholastic_stat;
	var savemode = request.body.savemode;

	let values = [studid,sy,sem,studmajor,regdate,gpa,scholarcode,studlevel,cur_year,status,maxload,block,scholastic_stat]

	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			if(savemode === 'INSERT'){

				var Query = "INSERT INTO semstudent( studid, sy, sem, studmajor, regdate, gpa, scholarcode, studlevel,cur_year, status, maxload, block, standing) "+
					          " VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)";
				db.query(Query,[...values],(err,table) =>{
					if(err){
						console.log(err);
					}
					else {
						var result = table.rows;
							db.end();
							response.send({result, message: 'Data inserted!',status: "OK"});
					}
				})
			}
			if(savemode === 'UPDATE'){
				var Query = "UPDATE semstudent SET status=$1, maxload=$2, standing=$3,studlevel=$7,cur_year=$8 WHERE studid=$4 and sy=$5 and sem=$6";
				db.query(Query,[status,maxload,scholastic_stat,studid,sy,sem,studlevel,cur_year],(err,table) =>{
					if(err){
						console.log(err);
					}
					else {
						var result = table.rows;
							db.end();
							response.send({result,message: 'Data updated!',status: "OK"});
					}
				})
			}
		}
	})
});

//****END of Enrolling student, insert/update semstudent ***//

//**** Register component ***//
router.post('/registration', function(request, response) {
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;

	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = "SELECT distinct REGISTRATION.StudID, REGISTRATION.subjcode, REGISTRATION.section, REGISTRATION.SY, REGISTRATION.Sem, Schedule.days, Schedule.fromtime, Schedule.totime, "+
		             " SUBJECT.courseno,Schedule.fromtime,(to_char(to_timestamp(schedule.fromtime::text,'HH24:MI'),'HH12:MI AM')||'-'||to_char(to_timestamp(schedule.totime::text,'HH24:MI'),'HH12:MI AM'))::varchar as skedtime "+
		             "  ,subject.description::varchar as description, subject.lab, subject.lec, subject.unit, OfferedSubject.is_requested, REGISTRATION.datevalidated "+
								 " FROM SUBJECT INNER JOIN ((OfferedSubject INNER JOIN Schedule ON (OfferedSubject.Sem = Schedule.Sem) AND (OfferedSubject.SY = Schedule.SY) AND (OfferedSubject.section = Schedule.section) AND (OfferedSubject.subjcode = Schedule.subjcode)) "+
								 " INNER JOIN REGISTRATION ON (OfferedSubject.Sem = REGISTRATION.Sem) AND (OfferedSubject.SY = REGISTRATION.SY) AND (OfferedSubject.section = REGISTRATION.section) AND (OfferedSubject.subjcode = REGISTRATION.subjcode)) ON SUBJECT.subjcode = OfferedSubject.subjcode "+
								 " WHERE REGISTRATION.StudID=$1 AND REGISTRATION.SY=$2 AND REGISTRATION.Sem=$3 "+
								 " ORDER BY courseno ";
			db.query(Query,[studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
						db.end();
						response.send(table.rows);
				}
			})
		}
	})
});
//**** End of register component ***//


//**Get subject details**//
router.get('/getCourses', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT subjcode,description,lec,lab,unit,courseno FROM subject where is_active ORDER BY college', (err,table) =>{
        if(err){
          console.log(err);
        }
        else {
          db.end();
          res.send(table.rows);
        }
      })
    }
  })
});
//** End of getting subject**//

//** Get sections of selected course ** //
router.post('/getSections', function(request, response) {
	var sy = request.body.sy;
	var sem = request.body.sem;
	var subjcode = request.body.subjcode;
	var progcode = request.body.progcode;

	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = "SELECT DISTINCT * FROM "+
								" (SELECT DISTINCT SUBJECT.courseno, OfferedSubject.subjcode, OfferedSubject.section, OfferedSubject.SY, OfferedSubject.Sem, "+
								" (to_char(to_timestamp(Schedule.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')|| '-' ||to_char(to_timestamp(Schedule.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM'))::varchar as skedtime, "+
								" Schedule.days,OfferedSubject.Slots as quota,(OfferedSubject.Slots-OfferedSubject.Enrollees)::int2 as slots,subject.unit, "+
								" OfferedSubject.is_restricted,(CASE WHEN OfferedSubject.is_reQUESTED THEN 'REQ' ELSE 'REG' END)::VARCHAR AS OFFERING, "+
								" subject.description::varchar as description, subject.lab, subject.lec, subject.unit "+
								" FROM subject,offeredsubject,schedule,offeredFor "+
								" WHERE subject.subjcode=offeredsubject.subjcode and offeredsubject.subjcode=schedule.subjcode and offeredsubject.section=schedule.section and offeredsubject.sy=schedule.sy and offeredsubject.sem=schedule.sem "+
								" AND  offeredsubject.subjcode=offeredFor.subjcode and offeredsubject.section=offeredFor.section and offeredsubject.sy=offeredFor.sy and offeredsubject.sem=offeredFor.sem "+
								"  AND  (OfferedSubject.Slots-OfferedSubject.Enrollees)>0 "+
								"  AND  OfferedSubject.SY=$1 AND OfferedSubject.Sem=$2 AND OfferedSubject.subjcode=$3 "+
								"  AND (OfferedSubject.is_restricted=false OR (OfferedSubject.is_restricted AND offeredFor.progcode=$4 )) "+
								" UNION "+
								" SELECT DISTINCT SUBJECT.courseno, OfferedSubject.subjcode, OfferedSubject.section, OfferedSubject.SY, OfferedSubject.Sem,  "+
								" (to_char(to_timestamp(Schedule.fromtime::text, 'HH24:MI:SS'::text), 'HH12:MI AM')|| '-' ||to_char(to_timestamp(Schedule.totime::text, 'HH24:MI:SS'::text), 'HH12:MI AM'))::varchar as skedtime, "+
								" Schedule.days,OfferedSubject.Slots as quota,(OfferedSubject.Slots-OfferedSubject.Enrollees)::int2 as slots,subject.unit, "+
								" OfferedSubject.is_restricted,(CASE WHEN OfferedSubject.is_reQUESTED THEN 'REQ' ELSE 'REG' END)::VARCHAR AS OFFERING, "+
								" subject.description::varchar as description, subject.lab, subject.lec, subject.unit "+
								" FROM subject,offeredsubject,schedule "+
								" WHERE subject.subjcode=offeredsubject.subjcode and offeredsubject.subjcode=schedule.subjcode and offeredsubject.section=schedule.section and offeredsubject.sy=schedule.sy and offeredsubject.sem=schedule.sem "+
								"  AND  (OfferedSubject.Slots-OfferedSubject.Enrollees)>0 "+
								"  AND  OfferedSubject.SY=$1 AND OfferedSubject.Sem=$2 AND OfferedSubject.subjcode=$3 "+
								"  AND OfferedSubject.is_restricted=false) as qry ";
			db.query(Query,[sy,sem,subjcode,progcode],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
					if(table.rows.length > 0){
						var result = table.rows;
						db.end();
						response.send({result,haveSection: "TRUE"});
					}else{
						db.end();
						response.send({haveSection: "FALSE"});
					}

				}
			})
		}
	})
});

//** END of getting sections of selected course ** //

//** Enroll Course ** //
router.post('/enrollCourse', function(request, response) {
	var studid = request.body.studid
	var sy = request.body.sy;
	var sem = request.body.sem;
	var subjcode = request.body.subjcode;
	var section = request.body.section;
	var progcode = request.body.progcode;
	var courseno = request.body.courseno;
	var maxload = request.body.maxload;
	var is_dean = request.body.is_dean;

	var is_allowed=0,load=0;
	var message = "";
	var result=[];

	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = "SELECT sum(unit) as load from "+
									" (SELECT subjcode, unit FROM ( "+
									" SELECT distinct R.subjcode,subject.unit "+
									"  , (select d.grade from registration d where d.subjcode=r.subjcode and d.studid=r.studid and not(d.sy=r.sy and d.sem ilike r.sem) order by d.sy desc, d.sem desc limit 1) AS GR "+
									" FROM subject,registration R "+
									" WHERE subject.subjcode=R.subjcode  "+
									"  and not(R.subjcode like 'NSTP%' OR R.subjcode like 'MS %' OR R.subjcode like 'ENGL R%'  OR R.subjcode like 'MATH R%') "+
									"  and studid=$1 and sy=$2 and sem=$3) AS A "+
									" WHERE (not GR IN ('IN PROG', 'IN PROGRESS')) OR GR ISNULL "+
									" UNION "+
									" SELECT distinct registration.subjcode,subject.lec as unit "+
									" FROM subject,registration "+
									" WHERE subject.subjcode=registration.subjcode and (registration.subjcode like 'ENGL R%' OR registration.subjcode like 'MATH R%') "+
									" and studid=$1 and sy=$2 and sem=$3) as qry ";
			db.query(Query,[studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
						is_allowed = 0;
						if(table.rows[0].load === null){
							load = 0;
						}else{
							load = parseInt(table.rows[0].load);
						}

						console.log(load);

						var Query1 = " SELECT * from offeredFor where subjcode=$1 and section=$2 "+
          								" and progcode=$3 and sy=$4 and sem=$5 ";
						db.query(Query1,[subjcode,section,progcode,sy,sem],(err,table) =>{
							if(err){
								console.log(err);
							}
							else {
									var is_allowed = table.rows.length;

									var Query2 = " SELECT subjcode, unit FROM (SELECT s.unit, s.subjcode " +
											        " , (select d.grade from registration d where d.subjcode=s.subjcode and d.studid=$1  " +
											        " and not(d.sy=$3 and d.sem ilike $4) order by d.sy desc, d.sem desc limit 1) AS GR  " +
											        " from subject s where s.subjcode=$2 AND not(s.subjcode like 'NSTP%' OR s.subjcode like 'MS %' )) AS A  " +
											        " WHERE (not GR IN ('IN PROG', 'IN PROGRESS')) OR GR ISNULL ";
									db.query(Query2,[studid,subjcode,sy,sem],(err,table) =>{
										if(err){
											console.log(err);
										}
										else {
											console.log(table.rows);
											if(table.rows.length === 0){
												load = parseInt(load);
											}else{
													load = parseInt(load) + parseInt(table.rows[0].unit);
											}

												var Query3 = " SELECT is_stud_conflict($1,$2,$3,$4,$5) as can_add ";
												db.query(Query3,[studid,subjcode,section,sy,sem],(err,table) =>{
													if(err){
														console.log(err);
													}
													else {
															var can_add = table.rows[0].can_add;
															console.log(can_add);
															if(can_add === 'false'  && (is_dean=== 'False')){
																	message = "Only the Dean's account can add conflict schedule.";
																	//result.push(message);
																	db.end();
																	response.send({message,add: "FALSE",loadexceed:"false",load: load});
															}
															else if(can_add === 'false'  ){
																	message = "WARNING! " + courseno + " is conflict with other schedule.";
																	db.end();
																	response.send({message,add: "FALSE",loadexceed:"false",load: load});
															}
															else if( load <= parseInt(maxload) && can_add === true){
																	var Query4 = " INSERT INTO registration (studid,sy,sem,subjcode,section) "+
	            																" VALUES($1,$4,$5,$2,$3) ";
																	db.query(Query4,[studid,subjcode,section,sy,sem],(err,table) =>{
																		if(err){
																			console.log(err);
																		}
																		else {
																			message = "Added";
																			//result.push(message);
																			db.end();
																			response.send({message,add: "TRUE",loadexceed:"false",load: load});
																		}
																	})
															}else if( load <= parseInt(maxload) && can_add == false){
																	var Query4 = " INSERT INTO registration (studid,sy,sem,subjcode,section) "+
	            																" VALUES($1,$4,$5,$2,$3) ";
																	db.query(Query4,[studid,subjcode,section,sy,sem],(err,table) =>{
																		if(err){
																			console.log(err);
																		}
																		else {
																			message = "Added";
																			//result.push(message);
																			db.end();
																			response.send({message,add: "TRUE",loadexceed:"false",load: load});
																		}
																	})
															}else if(load > parseInt(maxload)){
																message = "ERROR: Maximum study load exceeded.";
																//result.push({message,add: "FALSE"});
																db.end();
																response.send({message,add: "FALSE",loadexceed:"true",load: load});
															}else{
																message ="ERROR: Unable to add course offering.";
																//result.push({message,add: "FALSE"});
																db.end();
																response.send({message,add: "FALSE",loadexceed:"false",load: load});
															}
													}
												})
										}
									})
							}
						})
				}
			})
		}
	})
});
//** END of enrolling student course ** //

//**** Getting enrolled courses ***//
router.post('/getEnrolledCourses', function(request, response) {
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;
	var subjcode = request.body.subjcode;
	var courses = [];

	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = " SELECT * from registration where studid=$1 and sy=$2 and sem=$3 ";
			db.query(Query,[studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
					if(table.rows.length > 0){
							for(var i=0; i< table.rows.length; i++){
								var sub = table.rows[i].subjcode
								var Query = " SELECT * from subject where subjcode = $1";
								db.query(Query,[sub],(err,table) =>{
									if(err){
										console.log(err);
									}
									else {
										if(table.rows.length > 0){
												for(var i=0; i< table.rows.length; i++){

												}
										}
									}
								})
							}
					}
				}
			})
		}
	})
});
//**** END of getting enrolled courses ***//

//** Cancel enrolling course **//
router.post('/cancelEnrollCourse', function(request, response) {
	var studid = request.body.studid
	var sy = request.body.sy;
	var sem = request.body.sem;
	var subjcode = request.body.subjcode;
	var section = request.body.section;

	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = " DELETE from registration "+
					        " WHERE studid=$1 AND sy=$2 AND sem=$3 "+
					        " AND subjcode=$4 AND section=$5 ";
			db.query(Query,[studid,sy,sem,subjcode,section],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
						var Query1 ="SELECT distinct REGISTRATION.StudID, REGISTRATION.subjcode, REGISTRATION.section, REGISTRATION.SY, REGISTRATION.Sem, Schedule.days, Schedule.fromtime, Schedule.totime, "+
					             " SUBJECT.courseno,Schedule.fromtime,(to_char(to_timestamp(schedule.fromtime::text,'HH24:MI'),'HH12:MI AM')||'-'||to_char(to_timestamp(schedule.totime::text,'HH24:MI'),'HH12:MI AM'))::varchar as skedtime "+
					             "  ,subject.description::varchar as description, subject.lab, subject.lec, subject.unit, OfferedSubject.is_requested, REGISTRATION.datevalidated "+
											 " FROM SUBJECT INNER JOIN ((OfferedSubject INNER JOIN Schedule ON (OfferedSubject.Sem = Schedule.Sem) AND (OfferedSubject.SY = Schedule.SY) AND (OfferedSubject.section = Schedule.section) AND (OfferedSubject.subjcode = Schedule.subjcode)) "+
											 " INNER JOIN REGISTRATION ON (OfferedSubject.Sem = REGISTRATION.Sem) AND (OfferedSubject.SY = REGISTRATION.SY) AND (OfferedSubject.section = REGISTRATION.section) AND (OfferedSubject.subjcode = REGISTRATION.subjcode)) ON SUBJECT.subjcode = OfferedSubject.subjcode "+
											 " WHERE REGISTRATION.StudID=$1 AND REGISTRATION.SY=$2 AND REGISTRATION.Sem=$3 "+
											 " ORDER BY courseno ";
						 db.query(Query1,[studid,sy,sem],(err,table) =>{
								if(err){
									console.log(err);
								}else{
									console.log(table.rows);
									if(table.rows.length > 0){
										db.end();
										response.send({message: "Course successfully deleted!",can_delete: "TRUE"});
									}else{
										db.end();
										response.send({message:"WARNING! Do you wish to delete the student''s record of the current semester?", can_delete: "FALSE"});
									}
								}
						})
				}
			})
		}
	})
});
//** END of Cancelling enrolled course **//

//** Delete student's record for the current semester **//
router.post('/deleteStudentrec', function(request, response) {
	var studid = request.body.studid
	var sy = request.body.sy;
	var sem = request.body.sem;
	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = " DELETE from studtuitionlab "+
					        " WHERE studid=$1 AND sy=$2 AND sem=$3 ";
			db.query(Query,[studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
						var Query1 ="DELETE from studsubjmisc "+
								        " WHERE studid=$1 AND sy=$2 AND sem=$3";
						 db.query(Query1,[studid,sy,sem],(err,table) =>{
								if(err){
									console.log(err);
								}else{
									var Query2 ="DELETE from studbalance "+
											        " WHERE studid=$1 AND sy=$2 AND sem=$3";
									 db.query(Query2,[studid,sy,sem],(err,table) =>{
											if(err){
												console.log(err);
											}else{
												var Query2 ="DELETE from semstudent "+
														        " WHERE studid=$1 AND sy=$2 AND sem=$3";
												 db.query(Query2,[studid,sy,sem],(err,table) =>{
														if(err){
															console.log(err);
														}else{
															db.end();
															response.send({message: "Successfully deleted!", isdeleted:"TRUE"});
														}
												})
											}
									})
								}
						})
				}
			})
		}
	})
});
//**END Deleting student's record for the current semester**//

//****Add 1 slot with  verification code ***//
router.post('/verificationCodeSubmission', function(request, response) {
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;
	var vercode = request.body.vercode;
	var maxload = request.body.maxload;
	var is_dean = request.body.is_dean;

	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = "SELECT * FROM add1slot WHERE vercode=$1::numeric AND studid=$2 AND sy=$3 AND sem=$4";
			db.query(Query,[vercode,studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
					if(table.rows.length > 0){
						var versubjcode = table.rows[0].subjcode;
						var versection = table.rows[0].section;
						console.log(versubjcode);
						var Query = "SELECT sum(unit) as load from "+
												" (SELECT subjcode, unit FROM ( "+
												" SELECT distinct R.subjcode,subject.unit "+
												"  , (select d.grade from registration d where d.subjcode=r.subjcode and d.studid=r.studid and not(d.sy=r.sy and d.sem ilike r.sem) order by d.sy desc, d.sem desc limit 1) AS GR "+
												" FROM subject,registration R "+
												" WHERE subject.subjcode=R.subjcode  "+
												"  and not(R.subjcode like 'NSTP%' OR R.subjcode like 'MS %' OR R.subjcode like 'ENGL R%'  OR R.subjcode like 'MATH R%') "+
												"  and studid=$1 and sy=$2 and sem=$3) AS A "+
												" WHERE (not GR IN ('IN PROG', 'IN PROGRESS')) OR GR ISNULL "+
												" UNION "+
												" SELECT distinct registration.subjcode,subject.lec as unit "+
												" FROM subject,registration "+
												" WHERE subject.subjcode=registration.subjcode and (registration.subjcode like 'ENGL R%' OR registration.subjcode like 'MATH R%') "+
												" and studid=$1 and sy=$2 and sem=$3) as qry ";
							db.query(Query,[studid,sy,sem],(err,table) =>{
								 if(err){
									 console.log(err);
								 }
								 else {
										 var is_allowed = 1;
										 var restricted = false;
										 let load = table.rows[0].load;
										 var Query1 = "SELECT subjcode, unit FROM (SELECT s.unit, s.subjcode " +
			 										        " , (SELECT d.grade FROM registration d WHERE d.subjcode=s.subjcode AND d.studid=$1 " +
			 										        " AND not(d.sy=$2 AND d.sem ilike $3) ORDER BY d.sy desc, d.sem desc limit 1) AS GR " +
			 										        " FROM subject s where s.subjcode=$4 AND not(s.subjcode like 'NSTP%' OR s.subjcode like 'MS %' )) AS A " +
			 										        " WHERE (not GR IN ('IN PROG', 'IN PROGRESS')) OR GR ISNULL ";
			 							db.query(Query1,[studid,sy,sem,versubjcode],(err,table) =>{
			 								if(err){
			 									console.log(err);
			 								}
			 								else {
													load = load + table.rows[0].unit;

													var Query3 = " SELECT is_stud_conflict($1,$2,$3,$4,$5) as can_add ";
													db.query(Query3,[studid,versubjcode,versection,sy,sem],(err,table) =>{
														if(err){
															console.log(err);
														}
														else {
																var can_add = table.rows[0].can_add;
																// console.log(can_add);
																if(can_add === false){
																		message = "WARNING! " + versubjcode + " is conflict with other schedule.";
																		db.end();
																		response.send({message,add: "FALSE"});
																}
																// else if(can_add === 'false'  && (is_dean=== 'false')){
																// 	message = "Only the Dean's account can add conflict schedule.";
																// }
																else if(load <= maxload && can_add === true ){
																	var Query3 = " SELECT ((slots-enrollees)<1) as puno FROM offeredsubject WHERE subjcode=$1 AND section=$2 AND sy=$3 AND sem=$4 ";
																	db.query(Query3,[versubjcode,versection,sy,sem],(err,table) =>{
																		if(err){
																			console.log(err);
																		}
																		else {
																				if(table.rows.length > 0){
																					if(table.rows[0].puno){

																						var Query = " UPDATE offeredsubject SET slots=slots+1 WHERE subjcode=$1 AND section=$2 AND sy=$3 AND sem=$4 ";
																						db.query(Query,[versubjcode,versection,sy,sem],(err,table) =>{
																							if(err){
																								console.log(err);
																							}
																							else {
																								console.log("UPDATED!");
																							}
																						})
																					}
																					var Query = " INSERT INTO registration (studid,sy,sem,subjcode,section) VALUES($1,$2,$3,$4,$5) ";
																					db.query(Query,[studid,sy,sem,versubjcode,versection],(err,table) =>{
																						if(err){
																							console.log(err);
																						}
																						else {
																							console.log("INSERTED!");
																						}
																					})
																				}else{
																					db.end();
																					response.send({message: "Course Offering was dissolved."})
																				}
																		}
																	})
																}else if(load <= maxload && can_add === false){ //&& is_dean===true && Res = yes
																	var Query3 = " SELECT ((slots-enrollees)<1) as puno FROM offeredsubject WHERE subjcode=$1 AND section=$2 AND sy=$3 AND sem=$4 ";
																	db.query(Query3,[versubjcode,versection,sy,sem],(err,table) =>{
																		if(err){
																			console.log(err);
																		}
																		else {
																			if(table.rows.length > 0){
																				if(table.rows[0].puno){

																					var Query = " UPDATE offeredsubject SET slots=slots+1 WHERE subjcode=$1 AND section=$2 AND sy=$3 AND sem=$4 ";
																					db.query(Query,[versubjcode,versection,sy,sem],(err,table) =>{
																						if(err){
																							console.log(err);
																						}
																						else {
																							console.log("UPDATED!");
																						}
																					})
																				}
																				var Query = " INSERT INTO registration (studid,sy,sem,subjcode,section) VALUES($1,$2,$3,$4,$5) ";
																				db.query(Query,[studid,sy,sem,versubjcode,versection],(err,table) =>{
																					if(err){
																						console.log(err);
																					}
																					else {
																						db.end();
																						response.send({message: "Successfully added 1 slot!"});
																						console.log("INSERTED!");
																					}
																				})
																			}else{
																				db.end();
																				response.send({message: "Course Offering was dissolved."})
																			}
																		}
																	})
																}else if(load > maxload){
																	db.end();
																	response.send({message:"ERROR: Maximum study load exceeded." })
																}else{
																	db.end();
																	response.send({message: "ERROR: Unable to add course offering."});
																}
						 								}
						 							})
											 }
										 })
									}
								})
					}else{
						db.end();
						response.send({message: "Unmatching Verification Code for this student."});
					}
				}
			})
		}
	})
});
//**** END of adding slot from verification code***//

//*** General Percentage Average **//
router.post('/getGPA',function(request,response){
	var studid = request.body.studid;
	var prevsy = request.body.prevsy;
	var prevsem = request.body.prevsem;

	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT s.sy, s.sem, s.studid, s.studmajor, s.cur_year, count(r.subjcode) AS subjcnt "+
						      " FROM semstudent s, (select * from sysem where sy||sem<$2||$3) as y, registration r, subject j "+
						      " WHERE s.sy=y.sy and s.sem=y.sem and s.studid=r.studid and s.sy=r.sy and s.sem=r.sem and j.subjcode=r.subjcode "+
						      "  and s.studid=$1 and not (r.subjcode ilike 'NSTP%' or r.subjcode ilike 'MS %') and not description ilike '%military%' "+
						      " GROUP BY s.sy, s.sem, s.studid, s.studmajor, s.cur_year having sum(case when grade='DRP' or grade isnull then 0 else 1 end) > 0 "+
						      " ORDER BY s.sy desc, s.sem DESC LIMIT 1";

			db.query(Query,[studid,prevsy,prevsem],(err,table) =>{
				if(err){
					console.log(err);
				}else{
					if(table.rows.length > 0){
						var Query = "SELECT gpa($1, $2, $3) AS gpa";

						db.query(Query,[studid,prevsy,prevsem],(err,table) =>{
							if(err){
								console.log(err);
							}else{
									var gpa = table.rows[0].gpa;
									var Query = "UPDATE semstudent SET gpa=$4 WHERE studid=$1 and sy=$2 and sem=$3";

									db.query(Query,[studid,prevsy,prevsem,gpa],(err,table) =>{
										if(err){
											console.log(err);
										}else{
												db.end();
												response.send({message:"Student's GPA updated!"});
										}
									})
							}
						})
					}
				}
			})
		}
	})
});
//*** END General Percentage Average **//

//**** Printing of COR **//
router.post('/tuitionCompute',function(request,response){
	var progcode = request.body.progcode;
	var sy = request.body.sy;
	var sem = request.body.sem;
	var studid = request.body.studid;
	var result = [];
console.log(sem);
	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT sysemno from sysem where sy=$1 and sem=$2";

			db.query(Query,[sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}else{
						// console.log(table.rows[0].sysemno);
						let sysemno = table.rows[0].sysemno;
						var Query = "SELECT * FROM program WHERE progcode=$1";

						db.query(Query,[progcode],(err,table) =>{
							if(err){
								console.log(err);
							}else{
								if(sysemno < 24){  //School year 2007-2008 1st sem and below
									//console.log("24");
									var Query = "SELECT StudTuitionLab.StudID, StudTuitionLab.SY, StudTuitionLab.Sem, StudTuitionLab.AsCode, ASSESS.AsDesc, StudTuitionLab.Amount::NUMERIC(10,2) AS amount, FUND_TYPE.TypeCode, FUND_TYPE.AccDesc "+
														"  FROM FUND_TYPE INNER JOIN (ASSESS INNER JOIN StudTuitionLab ON ASSESS.AsCode = StudTuitionLab.AsCode) ON FUND_TYPE.TypeCode = ASSESS.TypeCode  "+
														"  WHERE (((StudTuitionLab.StudID)=$1) AND ((StudTuitionLab.SY)=$2) AND ((StudTuitionLab.Sem)=$3))  "+
														"  ORDER BY TypeCode, AsDesc ";

									db.query(Query,[studid,sy,sem],(err,table) =>{
										if(err){
											console.log(err);
										}else{
													result = table.rows;
												//	console.log(result,"kini");
													var Query = "SELECT sum(StudTuitionLab.Amount)::NUMERIC(10,2) as  totalamount  "+
																			"  FROM FUND_TYPE INNER JOIN (ASSESS INNER JOIN StudTuitionLab ON ASSESS.AsCode = StudTuitionLab.AsCode) ON FUND_TYPE.TypeCode = ASSESS.TypeCode "+
																			"  WHERE (((StudTuitionLab.StudID)=$1) AND ((StudTuitionLab.SY)=$2) AND ((StudTuitionLab.Sem)=$3)) ";
													db.query(Query,[studid,sy,sem],(err,table) =>{
														if(err){
															console.log(err);
														}else{
																result.push(table.rows);
																//console.log(table.rows);
																db.end();
																response.send(result);
														}
													})
										}
									})
								}else if(sysemno < 36){
									console.log("36");			//*** Academic Year 2011-2012 1st sem and below
									var Query = "SELECT * FROM sql_assess($1,$2,$3)";
									db.query(Query,[studid,sy,sem],(err,table) =>{
										if(err){
											console.log(err);
										}else{
											let result = table.rows;
											var Query = "SELECT sum(amount)::NUMERIC(10,2) AS totalamount FROM "+
																	" (SELECT * FROM sql_assess($1,$2,$3)) AS qry";
											db.query(Query,[studid,sy,sem],(err,table) =>{
												if(err){
													console.log(err);
												}else{
														result.push(table.rows);
														//console.log(result);
														db.end();
														response.send(result);
												}
											})
										}
									})
								}else{  		//*** Academic year 2011-2012 2nd sem and above, update due to new table in FARM
									//console.log("walay lain");
									var Query = "SELECT * FROM "+
															" (SELECT b.studid,b.acadyear as sy,b.semester as sem,b.type as ascode,c.description as asdesc,b.amount,a.typecode,f.accdesc "+
															"  FROM fund_type f,link_fmis.billingtypes c, assess a,  "+
															"  (SELECT c.studid,c.acadyear,c.semester,c.type,sum(c.amount) as amount  "+
															"   FROM link_fmis.billingaccounts c  "+
															"   WHERE c.studid=$1 and c.acadyear=$2 and c.semester=$3  "+
															"   GROUP BY c.studid,c.acadyear,c.semester,c.type) as b  "+
															"  WHERE f.typecode=a.typecode AND a.ascode=b.type AND b.type=c.code ORDER BY TypeCode, AsDesc) AS a  "+
															" WHERE ascode NOT IN (1,360,416,417,418,419,421,422,423,2,411,412,413,414,415)  "+
															" UNION  "+
															" SELECT studid,sy,sem,ascode,asdesc,sum(amount) as amount,typecode,accdesc FROM  "+
															" (SELECT studid,sy,sem,(case when ascode in (1,360,416,417,418,419,421,422,423) then 1 when ascode in (2,411,412,413,414,415) then 2 else ascode end) as ascode  "+
															"  ,(case when ascode in (1,360,416,417,418,419,421,422,423) then 'Tuition' when ascode in (2,411,412,413,414,415) then 'Laboratory' else asdesc end) as asdesc,amount,typecode,accdesc  "+
															"  FROM  "+
															"  (SELECT b.studid,b.acadyear as sy,b.semester as sem,b.type as ascode,c.description as asdesc,b.amount,a.typecode,f.accdesc  "+
															"   FROM fund_type f,link_fmis.billingtypes c, assess a,  "+
															"   (SELECT c.studid,c.acadyear,c.semester,c.type,sum(c.amount) as amount  "+
															"    FROM link_fmis.billingaccounts c  "+
															"    WHERE c.studid=$1 and c.acadyear=$2 and c.semester=$3  "+
															"    GROUP BY c.studid,c.acadyear,c.semester,c.type) as b  "+
															"   WHERE f.typecode=a.typecode AND a.ascode=b.type AND b.type=c.code  "+
															"   ORDER BY TypeCode, AsDesc) AS a  "+
															"  WHERE ascode IN (1,360,416,417,418,419,421,422,423,2,411,412,413,414,415) )AS b  "+
															" GROUP BY studid,sy,sem,ascode,asdesc,typecode,accdesc  "+
															" ORDER BY TypeCode, AsDesc";
									db.query(Query,[studid,sy,sem],(err,table) =>{
										if(err){
											console.log(err);
										}else{
											result=table.rows;
											//console.log(result);
											var Query = "SELECT sum(amount)::numeric(10,2) as totalamount FROM ( "+
																	" SELECT b.studid,b.acadyear as sy,b.semester as sem,b.type as ascode,c.description as asdesc,b.amount,a.typecode,f.accdesc "+
																	" FROM fund_type f,link_fmis.billingtypes c, assess a, "+
																	"  (SELECT c.studid,c.acadyear,c.semester,c.type,sum(c.amount) as amount "+
																	"  FROM link_fmis.billingaccounts c "+
																	"  WHERE c.studid=$1 and c.acadyear=$2 and c.semester=$3 "+
																	"  GROUP BY c.studid,c.acadyear,c.semester,c.type) as b "+
																	" WHERE f.typecode=a.typecode AND a.ascode=b.type AND b.type=c.code "+
																	" ) as qry";
											db.query(Query,[studid,sy,sem],(err,table) =>{
												if(err){
													console.log(err);
												}else{
														let totalpayable=0;
														if(table.rows.length > 0){
															 totalpayable = parseFloat(table.rows[0].totalamount);
														}else{
															 totalpayable = 0;
														}
														//Skedfees
														//console.log(totalpayable);
														db.end();
														response.send({result,totalpayable:totalpayable});
												}
											})
										}
									})
								}
							}
						})
				}
			})
		}
	})
});
//*** END of printing COR **//

//*** Skedfees(Printong COR provided to have an OR#) ***//
router.post('/skedfees',function(request,response){
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;
	var totalpayable = request.body.totalpayable;
	var username = request.body.username;

	let result = [];
	let entrance = 0.00;
	let prelim =0.00;
	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = "SELECT sysemno from sysem where sy=$1 and sem=$2";
			db.query(Query,[sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}else{
					let sysemno = table.rows[0].sysemno;

					if(sysemno < 33){
							var Query = "SELECT pays.amount FROM pays,receipt "+
											    " WHERE receipt.ornumber=pays.ornumber and receipt.student=true  "+
											    " and sy=$1 and sem=$2 and idno=$3 and pays.ascode=18";
							db.query(Query,[sy,sem,studid],(err,table) =>{
								if(err){
									console.log(err);
								}else{
									if(table.rows.length > 0){
										entrance = parseFloat(table.rows[0].amount);
									}
									let totalpayable33 = parseFloat(totalpayable) * 0.5;
									if(parseFloat(totalpayable) <= 1500){
										entrance = parseFloat(totalpayable);
										prelim = 0;
									}else if(totalpayable33 > 1500){
										entrance = totalpayable33;
										prelim = (parseFloat(totalpayable) - entrance);
									}else{
										entrance = (parseFloat(totalpayable)/2);
										prelim = (parseFloat(totalpayable) - entrance);

									}

									var Query = "SELECT 1 as rank,'Initial Fee' as sked,'$1'::float as amount "+
    													" UNION SELECT 2 as rank,'Prelim/Midterm Fee' as sked,'$2'::float as amount ORDER BY rank";
									db.query(Query,[entrance,prelim],(err,table) =>{
										if(err){
											console.log(err);
										}else{
											result.push({paymenthistory: table.rows});
										}
									})
								}
							})
					}else{
						if( sysemno < 36){					//before 2011-2012 2nd semester
							var Query = "SELECT sum(pays.amount)::numeric(10,2) as amount, receipt.ornumber, receipt.date FROM pays,receipt, "+
											    " (SELECT receipt.* FROM pays,receipt, (SELECT * FROM sql_assess($1,$2,$3)) as lst WHERE receipt.ornumber=pays.ornumber and "+
											    " receipt.student=true and lst.ascode=pays.ascode and receipt.sy=$2 and receipt.sem=$3 and receipt.idno=$1 ORDER BY date LIMIT 1 "+
											    " ) as ornum WHERE receipt.ornumber=pays.ornumber and receipt.student=true and receipt.sy=ornum.sy "+
											    "  and receipt.sem=ornum.sem and receipt.idno=ornum.idno and receipt.ornumber=ornum.ornumber "+
											    "  GROUP BY receipt.date, receipt.ornumber "+
											    " ORDER BY receipt.date";
							db.query(Query,[studid,sy,sem],(err,table) =>{
								if(err){
									console.log(err);
								}else{
										result.push({paymenthistory:table.rows});
								}
							})
						}else{		//after 2011-2012 1st

							var Query = "SELECT sum(p.amount)::numeric(10,2) as amount, r.refrcpt, r.receiptdate FROM link_fmis.collectionitems p,link_fmis.collections r, link_fmis.billingaccounts b, "+
											    " (SELECT r.*, b.acadyear, b.semester FROM link_fmis.collectionitems p,link_fmis.collections r, link_fmis.billingaccounts b, (SELECT * FROM sql_assess($1,$2,$3)) as lst WHERE r.receiptnum=p.receiptnum AND p.refcode=b.code "+
											    " AND b.acadyear=$2 and b.semester=$3 and R.refidno=$1 ORDER BY R.receiptDATE LIMIT 1 "+
											    " ) as ornum WHERE r.receiptnum=p.receiptnum AND p.refcode=b.code and b.acadyear=ornum.acadyear "+
											    "  and b.semester=ornum.semester and R.refidno=ornum.refidno and r.refrcpt=ornum.refrcpt "+
											    " GROUP BY r.receiptdate, r.refrcpt  "+
											    " ORDER BY r.receiptdate";
							db.query(Query,[studid,sy,sem],(err,table) =>{
								if(err){
									console.log(err);
								}else{
										if(table.rows.length === 0){
											entrance = 0;
											result.push({paymenthistory: []});
										}else{
											entrance = parseFloat(table.rows[0].amount);
											result.push({paymenthistory: table.rows});
										}

									//	console.log(entrance);
								}
							})
						}
						var Query = "SELECT replace(feescheme($1,$2),'::::','::') as sql";
						//console.log(entrance);
						db.query(Query,[entrance,totalpayable],(err,table) =>{
							if(err){
								console.log(err);
							}else{
									let sql = table.rows[0].sql;
									var Query = sql;
									console.log(sql);
									db.query(Query,(err,table) =>{
										if(err){
											console.log(err);
										}else{
												result.push({feescheme:table.rows});
										}
									})
							}
						})
					}
					var Query = " SELECT DISTINCT oid,sy,sem,studid,subjcode::varchar as subjcode,section::varchar as section,days,skedtime,room,bldg,description,lec,lab,unit,(CASE WHEN ((subjcode like 'NSTP%') OR (subjcode like 'MS %')  OR (subjcode like 'MTS %')) THEN '('||credit::varchar||')' ELSE credit::varchar END)::varchar as credit  FROM "+
											" (SELECT DISTINCT registration.oid,registration.sy,registration.sem,registration.studid,(case when offeredSubject.is_requested then '*'||subject.courseno else subject.courseno end) as subjcode,registration.section,  "+
											  	" schedule.days,(to_char(to_timestamp(schedule.fromtime::text,'HH24:MI'),'HH12:MI AM')||'-'||to_char(to_timestamp(schedule.totime::text,'HH24:MI'),'HH12:MI AM'))::varchar as skedtime,schedule.room,schedule.bldg, "+
											        	" subject.description::varchar as description,subject.lec::varchar as lec,subject.lab::varchar as lab,subject.lec::varchar as unit,subject.unit::varchar as credit "+
											      " FROM registration,offeredSubject,subject,schedule              "+
											      " WHERE subject.subjcode=offeredSubject.subjcode        "+
											      " 	and offeredSubject.subjcode=registration.subjcode "+
											      "   and offeredsubject.subjcode=subject.subjcode        "+
											      "   and offeredSubject.section=registration.section   "+
											      " 	and offeredSubject.sy=registration.sy     "+
											      " 	and offeredSubject.sem=registration.sem  "+
												" and schedule.subjcode=offeredsubject.subjcode  "+
												" and schedule.section=offeredsubject.section "+
											         "        and schedule.is_visible=true "+
												" and schedule.sy=offeredsubject.sy   "+
												" and schedule.sem=offeredsubject.sem "+
											      	" and registration.studid=$1 "+
											      	" and registration.sy=$2  "+
											     	" and registration.sem=$3  "+
											 " UNION "+
											 " SELECT DISTINCT registration.oid,registration.sy,registration.sem,registration.studid,''::varchar as subjcode,''::varchar as section,  "+
											  " schedule.days,(to_char(to_timestamp(schedule.fromtime::text,'HH24:MI'),'HH12:MI AM')||'-'||to_char(to_timestamp(schedule.totime::text,'HH24:MI'),'HH12:MI AM'))::varchar as skedtime,schedule.room,schedule.bldg,  "+
											  " ''::varchar as description,''::varchar as lec,''::varchar as lab ,''::varchar as unit,''::varchar as credit  "+
											  " FROM registration,offeredSubject,subject,schedule               "+
											  " WHERE subject.subjcode=offeredSubject.subjcode        "+
											  " and offeredSubject.subjcode=registration.subjcode   "+
											  " and offeredsubject.subjcode=subject.subjcode        "+
											  " and offeredSubject.section=registration.section   "+
											  " and offeredSubject.sy=registration.sy     "+
											  " and offeredSubject.sem=registration.sem  "+
												" and schedule.subjcode=offeredsubject.subjcode "+
												" and schedule.section=offeredsubject.section "+
											  " and schedule.is_visible=FALSE "+
												" and schedule.sy=offeredsubject.sy   "+
												" and schedule.sem=offeredsubject.sem "+
											  " and registration.studid=$1 "+
											  " and registration.sy=$2  "+
											  " and registration.sem=$3 ) as qry "+
											  " ORDER by oid, subjcode desc " ;
					db.query(Query,[studid,sy,sem],(err,table) =>{
						if(err){
							console.log(err);
						}else{
							result.push({COR:table.rows});
							var Query = "SELECT DISTINCT registration.oid,registration.sy,registration.sem,registration.studid,(case when offeredSubject.is_requested then '*'||subject.courseno else subject.courseno end) as subjcode,registration.section, "+
								        	" subject.description,subject.lec::varchar,subject.lab::varchar,subject.lec::varchar as unit,(CASE WHEN ((subject.subjcode like 'NSTP%') OR (subject.subjcode like 'MS %')  OR (subject.subjcode like 'MTS %')) THEN '('||unit::varchar||')' ELSE unit::varchar END)::varchar as credit    "+
										      " FROM registration,offeredSubject,subject,schedule "+
										      " WHERE subject.subjcode=offeredSubject.subjcode "+
									      	" and offeredSubject.subjcode=registration.subjcode "+
									        " and offeredsubject.subjcode=subject.subjcode "+
									        " and offeredSubject.section=registration.section "+
									      	" and offeredSubject.sy=registration.sy    "+
									      	" and offeredSubject.sem=registration.sem "+
													" and schedule.subjcode=offeredsubject.subjcode "+
													" and schedule.section=offeredsubject.section "+
													" and schedule.sy=offeredsubject.sy  "+
													" and schedule.sem=offeredsubject.sem  "+
									      	" and registration.studid=$1 "+
									      	" and registration.sy=$2 "+
								     			" and registration.sem=$3 "+
												 	" order by oid, subjcode";
							db.query(Query,[studid,sy,sem],(err,table) =>{
								if(err){
									console.log(err);
								}else{
									result.push({cashiersubj:table.rows});
									var Query = "SELECT distinct student.*,semstudent.*,studinfo.sex::varchar,scholar.scholar, qry.emp as emp,current_date as today, (substring(middlename,1,1)||'.')::varchar as mi "+
															" FROM student,semstudent,studinfo,scholar, "+
															" (select (firstname||' '||lastname)::varchar as emp from employee,encoder where encoder.empid=employee.empid AND encoder.username=$4) as qry  "+
															" WHERE student.studid=semstudent.studid "+
															" AND student.studid=studinfo.studid "+
															" AND scholar.scholarcode=semstudent.scholarcode   "+
															" AND semstudent.studid=$1 "+
															" AND semstudent.sy=$2 "+
															" AND semstudent.sem=$3 ";
									db.query(Query,[studid,sy,sem,username],(err,table) =>{
										if(err){
											console.log(err);
										}else{
												result.push({studinfo:table.rows});
												db.end();
												response.send(result);
										}
									})
								}
							})
						}
					})
				}//
			})
		}
	})
});
//*** END of Skedfees

/****Printing Statement of Account and COR ***/
router.post('/CORandSOA',function(request,response){
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;
	var or = request.body.or;
	var current_user = request.body.current;
	var current_date = request.body.current_date;
	var result = [];

console.log(studid,sy,sem,or,current_user,current_date)
	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			//check if Student ORNo exist for the sy, sem in PAYS table and all in COLLECTIONS table (disregard sy,sem)
			var Query = " SELECT r.idno, p.ornumber, sum(p.amount)::NUMERIC(10,2) as amount, r.sy, r.sem "+
									" FROM receipt r, pays p WHERE r.ornumber=p.ornumber AND idno=$1 AND sy=$2 AND sem=$3 AND p.ornumber=$4 GROUP BY r.idno, p.ornumber, r.sy, r.sem  "+
									" UNION  "+
									" SELECT r.refidno, r.refrcpt::VARCHAR, sum(p.amount)::NUMERIC(10,2) as amount, b.acadyear as sy, b.semester as sem  "+
									" FROM link_fmis.collections r, link_fmis.collectionitems p, link_fmis.billingaccounts b "+
									" WHERE r.receiptnum=p.receiptnum AND p.refcode=b.code AND r.refidno=$1 AND b.acadyear=$2 AND b.semester=$3 AND r.refrcpt::varchar=$4 GROUP BY r.refidno, r.refrcpt, b.acadyear, b.semester ";
			db.query(Query,[studid,sy,sem,or],(err,table) =>{
				if(err){
					console.log(err);
				}else{
					if(table.rows.length > 0){
						console.log("naa or");
						//new process effective 2016-2017 1st c/o registrar: validate if proceed printing
									var Query = " SELECT studid FROM validation WHERE studid=$1 AND sy=$2 AND sem=$3 UNION "+
															" SELECT 'OverRide' WHERE '2012-20131st' > '$2$3' ";
									db.query(Query,[studid,sy,sem],(err,table) =>{
										if(err){
											console.log(err);
										}else{
											result.push(table.rows);
											if(table.rows.length === 0){  //not yet validated
												var Query = " INSERT INTO validation(studid, sy, sem, username, date_validated, validatedby) "+
																		" VALUES($1,$2,$3,$4,$5,$4) ";
												db.query(Query,[studid,sy,sem,current_user,current_date],(err,table) =>{
													if(err){
														console.log(err);
													}else{
														var Query = " UPDATE registration SET datevalidated=$4 "+
																				" WHERE studid=$1 AND sy=$2 AND sem=$3";
														db.query(Query,[studid,sy,sem,current_date],(err,table) =>{
															if(err){
																console.log(err);
															}else{
																	result.push({message:"Student is now validated! "});
															}
														})
													}
												})
											}else{
												var Query = " UPDATE registration SET datevalidated=$4 "+
																		" WHERE studid=$1 AND sy=$2 AND sem=$3 AND datevalidated ISNULL";
												db.query(Query,[studid,sy,sem,current_date],(err,table) =>{
													if(err){
														console.log(err);
													}else{
														//console.log(table.rows);
														result.push({message:"Student validation updated! "});
													}
												})
											}

											//Total assessment
											var Query = " SELECT studid,sy,sem,sum(amount)::NUMERIC(10,2) as amount from "+
																	" (SELECT * FROM sql_assess($1, $2, $3)) as a group by studid,sy,sem ";
											db.query(Query,[studid,sy,sem],(err,table) =>{
												if(err){
													console.log(err);
												}else{
													result.push(table.rows);
													var Query = " SELECT R.IDNO, R.SY, R.SEM, R.DATE, SUM(P.AMOUNT)::NUMERIC(10,2) AS AMOUNT, R.ORNUMBER "+
																			" FROM RECEIPT R, PAYS P WHERE R.ORNUMBER=P.ORNUMBER AND R.IDNO=$1 "+
																			" AND R.SY=$2 AND R.SEM=$3 "+
																			" GROUP BY R.IDNO, R.SY, R.SEM, R.DATE, R.ORNUMBER UNION "+
																			" SELECT STUDID AS IDNO, SY, SEM, MDATE AS DATE, SUM(AMOUNT)::NUMERIC(10,2) AS AMOUNT, REMARKS AS ORNUMBER "+
																			" FROM DEBITMEMO WHERE STUDID=$1 "+
																			" AND SY=$2 AND SEM=$3 "+
																			" GROUP BY STUDID, SY, SEM, MDATE, REMARKS UNION "+
																			" SELECT r.refidno, b.acadyear as sy, b.semester as sem, R.receiptDATE as date, SUM(P.AMOUNT)::NUMERIC(10,2) AS AMOUNT, r.refrcpt::varchar "+
																			" FROM link_fmis.collections r, link_fmis.collectionitems p, link_fmis.billingaccounts b "+
																			" WHERE r.receiptnum=p.receiptnum AND p.refcode=b.code AND R.refidno=$1 "+
																			"  AND b.acadyear=$2 AND b.semester=$3 "+
																			" GROUP BY R.refidno, b.acadyear, b.semester, R.receiptDATE, R.refrcpt "+
																			" ORDER BY DATE DESC";
														db.query(Query,[studid,sy,sem],(err,table) =>{
															if(err){
																console.log(err);
															}else{
																result.push(table.rows);
																var Query = " SELECT v.*, upper('ENROLMENT VALIDATED on: '||v.date_validated||'     by: '||m.firstname ||' '|| CASE WHEN length(substring(m.middlename,1,1))=1 THEN substring(m.middlename,1,1)||'.' ELSE '' END ||' '|| m.lastname) ::varchar AS remark "+
																						"	FROM validation v, encoder e, employee m "+
																						"	WHERE v.username=e.username AND e.empid=m.empid AND v.studid=$1 AND sy=$2 AND sem=$3 ";
																	db.query(Query,[studid,sy,sem],(err,table) =>{
																		if(err){
																			console.log(err);
																		}else{
																			//console.log(result);
																				db.end();
																				response.send(result);
																		}
																	})
															}
														})
												}
											})
										}
									})
					}else{ // no OR check if student is scholar
						console.log("wala or");
						var Query = " SELECT ss.studid, s.schoolfunded, s.scholar FROM semstudent ss, scholar s "+
												" WHERE ss.scholarcode=s.scholarcode AND NOT upper(s.scholar)=upper('paying') AND sy=$2 "+
												" AND sem=$3 AND studid=$1";
							db.query(Query,[studid,sy,sem],(err,table) =>{
								if(err){
									console.log(err);
								}else{
									console.log(table.rows);
										if(table.rows.length > 0){	//check if scholar
											// new process effective 2016-2017 1st c/o registrar: validate if proceed printing
											var Query = "SELECT studid FROM validation WHERE studid=$1 AND sy=$2 AND sem=$3 UNION "+
																	" SELECT 'OverRide' WHERE '2012-20131st'>'$2$3' ";
												db.query(Query,[studid,sy,sem],(err,table) =>{
													if(err){
														console.log(err);
													}else{
														if(table.rows.length === 0){  //not yet validated
															var Query = " INSERT INTO validation(studid, sy, sem, username, date_validated, validatedby) "+
																					" VALUES($1,$2,$3,$4,$5,$4) ";
															db.query(Query,[studid,sy,sem,current_user,current_date],(err,table) =>{
																if(err){
																	console.log(err);
																}else{
																	var Query = " UPDATE registration SET datevalidated=$4 "+
																							" WHERE studid=$1 AND sy=$2 AND sem=$3";
																	db.query(Query,[studid,sy,sem,current_date],(err,table) =>{
																		if(err){
																			console.log(err);
																		}else{
																			var r = table.rows;
																			result.push({r,message:"Student is now validated! "});
																			console.log(result);
																		}
																	})
																}
															})
														}else{
															var Query = " UPDATE registration SET datevalidated=$4 "+
																					" WHERE studid=$1 AND sy=$2 AND sem=$3 AND datevalidated ISNULL";
															db.query(Query,[studid,sy,sem,current_date],(err,table) =>{
																if(err){
																	console.log(err);
																}else{
																	var r = table.rows;
																	result.push({r,message:"Student validation updated! "});
																	//console.log(result,current_date);
																}
															})
														}
													}
												})

												//total assessment
												var Query = " SELECT studid,sy,sem,sum(amount)::NUMERIC(10,2) as amount from "+
																		" (SELECT * FROM sql_assess($1, $2, $3)) as a group by studid,sy,sem ";
												db.query(Query,[studid,sy,sem],(err,table) =>{
													if(err){
														console.log(err);
													}else{
														result.push(table.rows);
//console.log(result);
														var Query = " SELECT R.IDNO, R.SY, R.SEM, R.DATE, SUM(P.AMOUNT)::NUMERIC(10,2) AS AMOUNT, R.ORNUMBER "+
																				" FROM RECEIPT R, PAYS P WHERE R.ORNUMBER=P.ORNUMBER AND R.IDNO=$1 "+
																				" AND R.SY=$2 AND R.SEM=$3 "+
																				" GROUP BY R.IDNO, R.SY, R.SEM, R.DATE, R.ORNUMBER UNION "+
																				" SELECT STUDID AS IDNO, SY, SEM, MDATE AS DATE, SUM(AMOUNT)::NUMERIC(10,2) AS AMOUNT, REMARKS AS ORNUMBER "+
																				" FROM DEBITMEMO WHERE STUDID=$1 "+
																				" AND SY=$2 AND SEM=$3 "+
																				" GROUP BY STUDID, SY, SEM, MDATE, REMARKS UNION "+
																				" SELECT r.refidno, b.acadyear as sy, b.semester as sem, R.receiptDATE as date, SUM(P.AMOUNT)::NUMERIC(10,2) AS AMOUNT, r.refrcpt::varchar "+
																				" FROM link_fmis.collections r, link_fmis.collectionitems p, link_fmis.billingaccounts b "+
																				" WHERE r.receiptnum=p.receiptnum AND p.refcode=b.code AND R.refidno=$1 "+
																				"  AND b.acadyear=$2 AND b.semester=$3 "+
																				" GROUP BY R.refidno, b.acadyear, b.semester, R.receiptDATE, R.refrcpt "+
																				" ORDER BY DATE DESC";
															db.query(Query,[studid,sy,sem],(err,table) =>{
																if(err){
																	console.log(err);
																}else{
																	result.push(table.rows);
																	var Query = " SELECT v.*, upper('ENROLMENT VALIDATED on: '||v.date_validated||'     by: '||m.firstname ||' '|| CASE WHEN length(substring(m.middlename,1,1))=1 THEN substring(m.middlename,1,1)||'.' ELSE '' END ||' '|| m.lastname) ::varchar AS remark "+
																							"	FROM validation v, encoder e, employee m "+
																							"	WHERE v.username=e.username AND e.empid=m.empid AND v.studid=$1 AND sy=$2 AND sem=$3 ";
																		db.query(Query,[studid,sy,sem],(err,table) =>{
																			if(err){
																				console.log(err);
																			}else{
																				//console.log(result);
																				result.push(table.rows);
																					db.end();
																					response.send({result,ok:"YES"});
																			}
																		})
																}
															})
													}
												})
										}else{
											db.end();
											response.send({message: "You must provide an OR or confirm your scholarship details at the OSAS",ok: "NO"});
										}
								}
							})
					}//*** END of Old rules
				}
			})
		}
	})
});
/**** END of printing Statement of Account and COR ***/

/****** Printing Statement of Account only ****/
router.post('/SOA',function(request,response){			//an option to possibly print the Statement of Account Only
	var studid = request.body.studid;
	var sy = request.body.sy;
	var sem = request.body.sem;
	let result = [];
	pool.connect((err,db,done) =>{
		if(err){
			console.log(err);
		}
		else{
			var Query = " SELECT studid,sy,sem,sum(amount)::NUMERIC(10,2) as amount from "+
									" (SELECT * FROM sql_assess($1, $2, $3)) as a group by studid,sy,sem ";
			db.query(Query,[studid,sy,sem],(err,table) =>{
				if(err){
					console.log(err);
				}else{
					result = table.rows;
					var Query = " SELECT R.IDNO, R.SY, R.SEM, R.DATE, SUM(P.AMOUNT)::NUMERIC(10,2) AS AMOUNT, R.ORNUMBER "+
											" FROM RECEIPT R, PAYS P WHERE R.ORNUMBER=P.ORNUMBER AND R.IDNO=$1 "+
											" AND R.SY=$2 AND R.SEM=$3 "+
											" GROUP BY R.IDNO, R.SY, R.SEM, R.DATE, R.ORNUMBER UNION "+
											" SELECT STUDID AS IDNO, SY, SEM, MDATE AS DATE, SUM(AMOUNT)::NUMERIC(10,2) AS AMOUNT, REMARKS AS ORNUMBER "+
											" FROM DEBITMEMO WHERE STUDID=$1 "+
											" AND SY=$2 AND SEM=$3 "+
											" GROUP BY STUDID, SY, SEM, MDATE, REMARKS UNION "+
											" SELECT r.refidno, b.acadyear as sy, b.semester as sem, R.receiptDATE as date, SUM(P.AMOUNT)::NUMERIC(10,2) AS AMOUNT, r.refrcpt::varchar "+
											" FROM link_fmis.collections r, link_fmis.collectionitems p, link_fmis.billingaccounts b "+
											" WHERE r.receiptnum=p.receiptnum AND p.refcode=b.code AND R.refidno=$1 "+
											"  AND b.acadyear=$2 AND b.semester=$3 "+
											" GROUP BY R.refidno, b.acadyear, b.semester, R.receiptDATE, R.refrcpt "+
											" ORDER BY DATE DESC";
						db.query(Query,[studid,sy,sem],(err,table) =>{
							if(err){
								console.log(err);
							}else{
								result.push(table.rows);
								db.end();
								response.send(result);
							}
						})
				}
			})
		}
	})
});
/****** END Printing Statement of Account only ****/

//***************************
//* End of Enrolment Module *
//***************************

module.exports = router;
