// 秒表状态和数据
let startTime = 0;        // 开始时间戳
let elapsedTime = 0;      // 已过去的时间
let lastTimestamp = 0;    // 上次时间戳
let isRunning = false;    // 运行状态
let animationFrameId = null; // 动画帧ID
let markCounter = 0;      // 标记计数器
let marks = [];           // 标记记录

// DOM 元素
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const markBtn = document.getElementById('markBtn');
const resetBtn = document.getElementById('resetBtn');
const markList = document.getElementById('markList');

// 格式化时间为 00:00:00:000 格式
function formatTime(timeInMilliseconds) {
  const totalMilliseconds = Math.floor(timeInMilliseconds);
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
}

// 更新计时器显示
function updateTimer(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  
  // 计算当前帧与上一帧的时间差
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  
  // 更新已用时间
  elapsedTime += deltaTime;
  
  // 更新显示
  timerElement.textContent = formatTime(elapsedTime);
  
  // 继续循环
  animationFrameId = requestAnimationFrame(updateTimer);
}

// 开始计时器
function startTimer() {
  if (isRunning) return;
  
  // 记录开始时间（调整为上次暂停时间）
  startTime = performance.now() - elapsedTime;
  lastTimestamp = performance.now();
  
  // 开始动画循环
  animationFrameId = requestAnimationFrame(updateTimer);
  
  // 更新状态和UI
  isRunning = true;
  startBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  markBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  resetBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  
  // 添加动画效果
  timerElement.classList.add('text-primary');
}

// 暂停计时器
function pauseTimer() {
  if (!isRunning) return;
  
  // 停止动画循环
  cancelAnimationFrame(animationFrameId);
  
  // 更新状态和UI
  isRunning = false;
  pauseBtn.classList.add('hidden');
  startBtn.classList.remove('hidden');
  
  // 恢复动画效果
  timerElement.classList.remove('text-primary');
}

// 打标记
function addMark() {
  if (!isRunning) return;
  
  // 记录当前时间点
  const markTime = elapsedTime;
  markCounter++;
  
  // 添加到标记数组
  marks.unshift({
    id: markCounter,
    time: markTime,
    formattedTime: formatTime(markTime)
  });
  
  // 更新UI
  renderMarks();
  
  // 为最新的标记添加动画效果
  const firstMark = markList.querySelector('li:first-child');
  if (firstMark) {
    firstMark.classList.add('marker-appear');
    setTimeout(() => {
      firstMark.classList.remove('marker-appear');
    }, 500);
  }
}

// 渲染标记列表
function renderMarks() {
  if (marks.length === 0) {
    markList.innerHTML = '<li class="py-3 text-gray-400 text-center italic">暂无标记记录</li>';
    return;
  }
  
  // 清空列表
  markList.innerHTML = '';
  
  // 添加所有标记
  marks.forEach((mark, index) => {
    const li = document.createElement('li');
    li.className = `py-3 px-2 flex justify-between items-center ${index === 0 ? 'font-medium' : ''}`;
    
    // 标记排名
    const rankSpan = document.createElement('span');
    rankSpan.className = 'text-gray-500 mr-2';
    rankSpan.textContent = `${mark.id}.`;
    
    // 标记时间
    const timeSpan = document.createElement('span');
    timeSpan.className = `text-white ${index === 0 ? 'text-primary' : ''}`;
    timeSpan.textContent = mark.formattedTime;
    
    // 最佳/最差标记指示器
    const indicatorSpan = document.createElement('span');
    if (marks.length > 1) {
      if (index === 0 && mark.time === Math.min(...marks.map(m => m.time))) {
        indicatorSpan.className = 'text-green-400 text-xs ml-2';
        indicatorSpan.innerHTML = '<i class="fa fa-arrow-down mr-1"></i>最佳';
      } else if (index === 0 && mark.time === Math.max(...marks.map(m => m.time))) {
        indicatorSpan.className = 'text-red-400 text-xs ml-2';
        indicatorSpan.innerHTML = '<i class="fa fa-arrow-up mr-1"></i>最差';
      }
    }
    
    li.appendChild(rankSpan);
    li.appendChild(timeSpan);
    li.appendChild(indicatorSpan);
    markList.appendChild(li);
  });
}

// 重置计时器
function resetTimer() {
  // 停止计时器
  if (isRunning) {
    pauseTimer();
  }
  
  // 重置数据
  startTime = 0;
  elapsedTime = 0;
  lastTimestamp = 0;
  marks = [];
  markCounter = 0;
  
  // 更新UI
  timerElement.textContent = '00:00:00:000';
  renderMarks();
  markBtn.classList.add('opacity-50', 'cursor-not-allowed');
  resetBtn.classList.add('opacity-50', 'cursor-not-allowed');
  
  // 恢复动画效果
  timerElement.classList.remove('text-primary');
}

// 添加事件监听器
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
markBtn.addEventListener('click', addMark);
resetBtn.addEventListener('click', resetTimer);

// 初始化
renderMarks();
    