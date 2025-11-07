// =====================
// Load config from localStorage
// =====================
let p1 = localStorage.getItem('ttt_p1') || 'Player 1';
let p2 = localStorage.getItem('ttt_p2') || 'Computer';
let mode = localStorage.getItem('ttt_mode') || 'single';
let diff = localStorage.getItem('ttt_diff') || 'normal';

// =====================
// Game variables
// =====================
let board = Array(9).fill(null);
let cells = Array.from(document.querySelectorAll('.cell'));
let currentPlayer = 'X';
let running = true;
let scores = { X: 0, O: 0, ties: 0 };
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// =====================
// DOM elements
// =====================
const statusEl = document.getElementById('status');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreTiesEl = document.getElementById('scoreTies');
const resultModal = document.getElementById('resultModal');
const resultText = document.getElementById('resultText');
const restartBtn = document.getElementById('restartBtn');
const closeModal = document.getElementById('closeModal');

// =====================
// Helper functions
// =====================
function getPlayerName(player){
    if(player === 'X') return p1 + " (X)";
    if(player === 'O') return p2 + " (O)";
    return '';
}

function getTurnClass(player){
    if(player === 'X') return 'turn-x'; // Player 1 → pink
    if(player === 'O') return 'turn-o'; // Player 2 → blue
    return '';
}

// =====================
// Scoreboard
// =====================
function renderScores(){
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreTiesEl.textContent = scores.ties;
}


// =====================
// Check winner
// =====================
function checkWinner(b){
  for(const combo of wins){
    const [a,b1,c] = combo;
    if(b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a];
  }
  return null;
}

// =====================
// AI logic
// =====================
function aiMove(){
  if(!running) return;
  let idx = null;
  if(diff === 'normal'){
    const empty = board.map((v,i)=>v===null?i:null).filter(v=>v!==null);
    if(Math.random()<0.5) idx = empty[Math.floor(Math.random()*empty.length)];
    else idx = findBestMove('O');
  } else idx = findBestMove('O');
  if(idx!==null) placeMark(idx);
}

function findBestMove(player){
  let bestVal = -Infinity, move = -1;
  for(let i=0;i<9;i++){
    if(board[i]===null){
      board[i]=player;
      let val = minimax(board,0,false,player);
      board[i]=null;
      if(val>bestVal){ bestVal=val; move=i; }
    }
  }
  return move;
}

function minimax(b,depth,isMax,player){
  const winner = checkWinner(b);
  if(winner===player) return 10-depth;
  if(winner && winner!==player) return depth-10;
  if(!b.includes(null)) return 0;

  if(isMax){
    let best=-Infinity;
    for(let i=0;i<9;i++){
      if(b[i]===null){
        b[i]=player;
        best=Math.max(best,minimax(b,depth+1,false,player));
        b[i]=null;
      }
    }
    return best;
  } else {
    let best=Infinity;
    const opp = player==='X'?'O':'X';
    for(let i=0;i<9;i++){
      if(b[i]===null){
        b[i]=opp;
        best=Math.min(best,minimax(b,depth+1,true,player));
        b[i]=null;
      }
    }
    return best;
  }
}

// =====================
// Place mark
// =====================
function placeMark(idx){
  if(board[idx]!==null || !running) return;
  board[idx] = currentPlayer;
  cells[idx].innerHTML = currentPlayer==='X' ? '<span class="mark-x">X</span>' : '<span class="mark-o">O</span>';


  const winner = checkWinner(board);
  if(winner){
    running = false;
    scores[winner]++;
    renderScores();
    const winLine = wins.find(line=>line.every(i=>board[i]===winner));
    if(winLine) winLine.forEach(i=>cells[i].classList.add('win'));
    showResult(getPlayerName(winner) + " wins!");

    return;
  }

  if(!board.includes(null)){
    running=false;
    scores.ties++;
    renderScores();
    showResult("It's a tie!");

    return;
  }

  // Switch player
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

  // Update status text
  statusEl.textContent = getPlayerName(currentPlayer) + " turn";

  // Update neon color class
  statusEl.classList.remove('turn-x','turn-o');
  statusEl.classList.add(getTurnClass(currentPlayer));

  // AI move if single-player
  if(mode==='single' && currentPlayer==='O' && running) setTimeout(aiMove,200);
}

// =====================
// Modal
// =====================
function showResult(result){
  resultText.textContent = result;
  resultModal.classList.add('show');
}

function hideModal(){
  resultModal.classList.remove('show');
}

// =====================
// Reset game
// =====================
function resetGame(){
  board = Array(9).fill(null);
  cells.forEach(cell=>{
    cell.innerHTML='';
    cell.classList.remove('mark-x','mark-o','win');
  });
  running = true;
  currentPlayer = 'X';
  statusEl.textContent = getPlayerName(currentPlayer) + " turn";
  statusEl.classList.remove('turn-x','turn-o');
  statusEl.classList.add(getTurnClass(currentPlayer));
  hideModal();
  if(mode==='single' && currentPlayer==='O') setTimeout(aiMove,200);
}

// =====================
// Event listeners
// =====================
cells.forEach((c,i)=>{
  c.addEventListener('click', ()=>{
    if(mode==='single' && currentPlayer!=='X') return;
    placeMark(i);
  });
});

restartBtn.addEventListener('click', resetGame);
closeModal.addEventListener('click', hideModal);
resultModal.addEventListener('click', e=>{
  if(e.target===resultModal) hideModal();
});

document.getElementById('newRoundBtn').addEventListener('click', resetGame);

// =====================
// Initial setup
// =====================
renderScores();
statusEl.textContent = getPlayerName(currentPlayer) + " turn";
statusEl.classList.add(getTurnClass(currentPlayer));
