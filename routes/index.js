var express = require('express');
var router = express.Router();
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
let pool = new pg.Pool(config);

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

router.get('/sample', function(req, res){
 res.send('hello from sample')
});

router.get('/getRoom',function(req, res){
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
		res.send(table.rows);
		}
   	  })
	 }
	})
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

//***************************
//END Scheduling Module *****
//***************************


/*/********************
//* Enrolment Module *
//********************/

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

//**** Get data in table registration ***//
router.get('/getRegistration', function(req, res) {
  pool.connect((err,db,done)=>{
    if(err){
      console.log(err);
    }
    else {
      db.query('SELECT * from registration', (err,table) =>{
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
//*** End of getting data in registration ***//

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

//** Get student data from prior sem **//

router.post('/whenNotFoundinStudenttag',function(request,response){
	var studid = request.body.studid;
	var sem = request.body.sem;
	var sy = request.body.sy;

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
								//*** Get Scholastic standing
								var result = table.rows;

								var Query3 = "SELECT scholastic_status($1,$3,$2) AS standing";

								db.query(Query3,[studid,sem,sy],(err,table) =>{
									if(err){
										console.log(err);
									}
									else{

										if(table.rows.length > 0){
											result.push(table.rows);

											var Query4 = "SELECT gpa($1,$3,$2) AS gpa";

											db.query(Query4,[studid,sem,sy],(err,table) =>{
												if(err){
													console.log(err);
												}
												else{
													if(table.rows.length > 0){
														result.push(table.rows);
														db.end();
														response.send(result);
													}
												}
											})
										}
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
									console.log(result);
									db.end();
									response.send(result);
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
router.post('/checkOfferingToStudentANDClearance', function(request, response) {
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
						var result = table.rows;
						var Query = "SELECT * FROM clearance.studentclearances WHERE studid=$1 AND datecleared isnull";
						db.query(Query,[studid],(err,table) =>{
							if(err){
								console.log(err);
							}
							else {
								if(table.rows.length > 0){
									//result.push({message: 'Sorry student cannot proceed enrollment. Student has uncleared clearance.',cleared:'false'});
									db.end();
									response.send({result,message: 'Sorry student cannot proceed enrollment. Student has uncleared clearance.',cleared:'false'});
								}else{
									//result.push({message: 'All accounts are settled', cleared:'true'});
									db.end();
									response.send({result,message: 'All accounts are settled', cleared:'true'});
								}
							}
						})
				}
			})
		}
	})
});
//***END Offered courses to given student data **//

//*** Check Clearnce ***//
router.post('/checkClearance', function(request, response) {
	var studid = request.body.studid;
	pool.connect((err,db,done)=>{
		if(err){
			console.log(err);
		}
		else {
			var Query = "SELECT * FROM clearance.studentclearances WHERE studid=$1 AND datecleared isnull";
			db.query(Query,[studid],(err,table) =>{
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
					if(table.rows.length === 0 && block != ''){
								var Query1 = "SELECT distinct $6,subjcode,section,sy,sem FROM offeredfor "+
											" WHERE sy=$1 and sem=$2 and  $4 ilike progcode||'%' and block=$3 and studlevel=$5";
								db.query(Query1,[sy,sem,block,progcode,year,studid],(err,table) =>{
									if(err){
										console.log(err);
									}
									else {
										if(table.rows.length > 0){
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
															console.log(table.rows);
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
							response.send({message:"No Block Supplied!"});
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
	var gpa = request.body.gpa;
	var scholarcode = request.body.scholarcode;
	var studlevel = request.body.year;
	var cur_year = request.body.cur_year;
	var status = request.body.status;
	var maxload = request.body.maxload;
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
				var Query = "UPDATE semstudent SET status=$1, maxload=$2, standing=$3 WHERE studid=$4 and sy=$5 and sem=$6";
				db.query(Query,[status,maxload,scholastic_stat,studid,sy,sem],(err,table) =>{
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
router.post('/zqryreg', function(request, response) {
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
						db.end();
						response.send(table.rows);
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
						load = table.rows[0].load;

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
											        " from subject s where s.subjcode=$2 AND not(s.subjcode like ''NSTP%'' OR s.subjcode like ''MS %'' )) AS A  " +
											        " WHERE (not GR IN (''IN PROG'', ''IN PROGRESS'')) OR GR ISNULL ";
									db.query(Query2,[studid,subjcode,sy,sem],(err,table) =>{
										if(err){
											console.log(err);
										}
										else {
												load = load + table.rows[0].unit

												var Query3 = " SELECT is_stud_conflict($1,$2,$3,$4,$5) as can_add ";
												db.query(Query3,[studid,subjcode,section,sy,sem],(err,table) =>{
													if(err){
														console.log(err);
													}
													else {
															var can_add = table.rows[0].can_add;
															if(can_add === 'false'){
																	message = "WARNING! " + courseno + " is conflict with other schedule.";
																	//result.push(message);
																	db.end();
																	response.send({message,add: "FALSE"});
															}
															// else if(can_add === 'false'  && (is_dean=== 'false')){
															// 	message = "Only the Dean's account can add conflict schedule.";
															// }
															if( load <= maxload && can_add ==='true'){
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
																		response.send({message,add: "TRUE"});
																	}
																})
															}else if( load <= maxload && can_add == 'false'){
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
																			response.send({message,add: "TRUE"});
																		}
																	})
															}else if(load > maxload){
																message = "ERROR: Maximum study load exceeded.";
																//result.push({message,add: "FALSE"});
																db.end();
																response.send({message,add: "FALSE"});
															}else{
																message ="ERROR: Unable to add course offering.";
																//result.push({message,add: "FALSE"});
																db.end();
																response.send({message,add: "FALSE"});
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
//** END of getting sections of selected course ** //

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
					        " WHERE studid=:idno AND sy=:sy AND sem=:sem "+
					        " AND subjcode=:subjcode AND section=:section ";
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
									if(table.rows.length > 0){
										db.end();
										response.send({can_delete: "FALSE"});
									}else{
										db.end();
										response.send({message:"WARNING! Do you wish to delete the student''s record of the current semester?", can_delete: "TRUE"});
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
					        " WHERE studid=:idno AND sy=:sy AND sem=:sem ";
			db.query(Query,[studid,sy,sem,subjcode,section],(err,table) =>{
				if(err){
					console.log(err);
				}
				else {
						var Query1 ="DELETE from studsubjmisc "+
								        " WHERE studid=:idno AND sy=:sy AND sem=:sem";
						 db.query(Query1,[studid,sy,sem],(err,table) =>{
								if(err){
									console.log(err);
								}else{
									var Query2 ="DELETE from studbalance "+
											        " WHERE studid=:idno AND sy=:sy AND sem=:sem";
									 db.query(Query2,[studid,sy,sem],(err,table) =>{
											if(err){
												console.log(err);
											}else{
												var Query2 ="DELETE from semstudent "+
														        " WHERE studid=:idno AND sy=:sy AND sem=:sem";
												 db.query(Query2,[studid,sy,sem],(err,table) =>{
														if(err){
															console.log(err);
														}else{
															db.end();
															response.send({message: "Successfully deleted!"});
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
							var result = table.rows;
							var subjcode = table.rows[0].subjcode;
							var section = table.rows[0].section;
							var Query1 = "SELECT subjcode, unit FROM (SELECT s.unit, s.subjcode " +
										        " , (SELECT d.grade FROM registration d WHERE d.subjcode=s.subjcode AND d.studid=$1 " +
										        " AND not(d.sy=$2 AND d.sem ilike $3) ORDER BY d.sy desc, d.sem desc limit 1) AS GR " +
										        " FROM subject s where s.subjcode=$4 AND not(s.subjcode like 'NSTP%' OR s.subjcode like 'MS %' )) AS A " +
										        " WHERE (not GR IN ('IN PROG', 'IN PROGRESS')) OR GR ISNULL ";
							db.query(Query,[studid,sy,sem,subjcode],(err,table) =>{
								if(err){
									console.log(err);
								}
								else {
										result.push(table.rows);
										var Query2 = "SELECT is_stud_conflict($1,$4,$5,$2,$3) as can_add";
										db.query(Query,[studid,sy,sem,subjcode,section],(err,table) =>{
											if(err){
												console.log(err);
											}
											else {
													result.push(table.rows);
													response.send(result);
													console.log(result);
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
//**** END of adding slot from verification code***//




//***************************
//* End of Enrolment Module *
//***************************

module.exports = router;
