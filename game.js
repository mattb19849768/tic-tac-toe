// Load config
let p1 = localStorage.getItem('ttt_p1') || 'Player 1';
let p2 = localStorage.getItem('ttt_p2') || 'Computer';
let mode = localStorage.getItem('ttt_mode') || 'single';
let diff = localStorage.getItem('ttt_diff') || 'normal';
let sound = localStorage.getItem('ttt_sound') || 'on';

let board = Array(9).fill(null);
let cells = Array.from(document.querySelectorAll('.cell'));
let currentPlayer = 'X';
let running = true;
let scores = {X:0,O:0,ties:0};

const statusEl = document.getElementById('status');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreTiesEl = document.getElementById('scoreTies');
const soundToggleBtn = document.getElementById('soundToggleBtn');

const soundX = document.getElementById('soundX');
const soundO = document.getElementById('soundO');
const soundWin = document.getElementById('soundWin');

const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

// Update scoreboard
function renderScores(){
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreTiesEl.textContent = scores.ties;
}

// Play sound
function playSound(id){if(sound==='on')document.getElementById(id).play();}

// Check winner
function checkWinner(b){
  for(const combo of wins){
    const [a,b1,c] = combo;
    if(b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a];
  }
  return null;
}

// AI functions
function aiMove(){
  let idx=null;
  if(diff==='normal'){
    const empty=board.map((v,i)=>v===null?i:null).filter(v=>v!==null);
    if(Math.random()<0.5) idx=empty[Math.floor(Math.random()*empty.length)];
    else idx=findBestMove('O');
  } else idx=findBestMove('O');
  if(idx!==null) placeMark(idx);
}

function findBestMove(player){
  let bestVal=-Infinity, move=-1;
  for(let i=0;i<9;i++){
    if(board[i]===null){
      board[i]=player;
      let val=minimax(board,0,false,player);
      board[i]=null;
      if(val>bestVal){bestVal=val; move=i;}
    }
  }
  return move;
}

function minimax(b,depth,isMax,player){
  const winner=checkWinner(b);
  if(winner===player) return 10-depth;
  if(winner && winner!==player) return depth-10;
  if(!b.includes(null)) return 0;
  if(isMax){
    let best=-Infinity;
    for(let i=0;i<9;i++){if(b[i]===null){b[i]=player;best=Math.max(best,minimax(b,depth+1,false,player));b[i]=null;}}
    return best;
  }else{
    let best=Infinity;
    const opp=player==='X'?'O':'X';
    for(let i=0;i<9;i++){if(b[i]===null){b[i]=opp;best=Math.min(best,minimax(b,depth+1,true,player));b[i]=null;}}
    return best;
  }
}

// Place mark
function placeMark(idx){
  if(board[idx]!==null||!running) return;
  board[idx]=currentPlayer;
  cells[idx].innerHTML=currentPlayer==='X'?'<span class="mark-x">X</span>':'<span class="mark-o">O</span>';
  playSound(currentPlayer==='X'?'soundX':'soundO');
  const winner=checkWinner(board);
  if(winner){
    running=false;
    statusEl.textContent = (winner==='X'?p1:p2)+" wins!";
    scores[winner]++;
    playSound('soundWin');
    renderScores();
    const winLine=wins.find(line => line.every(i=>board[i]===winner));
    if(winLine) winLine.forEach(i=>cells[i].classList.add('win'));
    return;
  }
  if(!board.includes(null)){
    running=false;
    statusEl.textContent="It's a tie!";
    scores.ties++;
    playSound('soundWin');
    renderScores();
    return;
  }
  currentPlayer = currentPlayer==='X'?'O':'X';
  statusEl.textContent=currentPlayer+"'s turn";
  if(mode==='single' && currentPlayer==='O' && running) setTimeout(aiMove,200);
}

// Event listeners
cells.forEach((c,i)=>c.addEventListener('click',()=>{
  if(mode==='single' && currentPlayer!=='X') return;
  placeMark(i);
}));

document.getElementById('newRoundBtn').addEventListener('click',()=>{
  board=Array(9).fill(null);
  cells.forEach(c=>{c.innerHTML=''; c.classList.remove('win');});
  running=true;
  currentPlayer='X';
  statusEl.textContent=currentPlayer+"'s turn";
  if(mode==='single' && currentPlayer==='O') setTimeout(aiMove,200);
});

soundToggleBtn.addEventListener('click',()=>{
  sound = sound==='on'?'off':'on';
  soundToggleBtn.textContent = 'Sound: '+(sound==='on'?'On':'Off');
});

renderScores();
statusEl.textContent=currentPlayer+"'s turn";
