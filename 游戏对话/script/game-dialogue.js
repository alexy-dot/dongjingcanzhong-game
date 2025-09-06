// 定义对话情节：人物图像、人物名称、对话、选项
const dialogue={
    1:{
        character_image:"./image/金木2.webp",
        character_position:"left",
        character_name:"金木",
        text:"你引以为傲的“折磨”，到最后只让我觉得滑稽 —— 无聊到让人想笑。",
        options:[],
        nextpoint:2
    },
    2:{
        character_image:"./image/壁虎1.jpg",
        character_position:"right",
        character_name:"壁虎",
        text:"哦？终于露出獠牙了？这才对嘛...",
        options:[],
        nextpoint:2.5
    },
    2.5:{
        character_image:"./image/壁虎1.jpg",
        character_position:"right",
        character_name:"壁虎",
        text:"你的痛苦、你的愤怒、甚至你的赫子... 我都要一点不剩地夺走！",
        options:[],
        nextpoint:3
    },

    3:{
        character_image:"./image/金木1.png",
        character_position:"left",
        character_name:"金木",
        text:"1000-7 は何ですか？",
        options:[],
        nextpoint:4
    },
    4:{
        character_image:"./image/金木1.png",
        character_position:"left",
        character_name:"金木",
        text:"答不出来？那我就帮你‘数’到想起来为止。",
        options:[],
        nextpoint:5
    },
    5:{
        character_image:"./image/壁虎2.jpeg",
        character_position:"right",
        character_name:"壁虎",
        text:"“混蛋！我要把你的赫子一根根扯断！把你剁成肉泥喂乌鸦 —— 让你永远记住谁是主宰！”​",
        options:[
            {text:"开始战斗",nextpoint:"redirect"},
        ],
        nextpoint:"redirect"
    }
   
};

let currentpointId=1;
let istypingComplete=false;
let currentTypingTimer=null;

const imgContainer=document.getElementById("imgContainer");
const characterImg=document.getElementById("characterImg");
const characterName=document.getElementById("characterName");
const dialogueText=document.getElementById("dialogueText");
const optionsContainer=document.getElementById("optionsContainer");

// 判断下一步动作是跳转节点还是跳转网页
function handlejump(nextpoint){
    const currentpoint=dialogue[currentpointId];
    const nextaction=nextpoint!==undefined?nextpoint:currentpoint.nextpoint;

    if(nextaction==="redirect"){
        window.location.href="../GAME/游戏1.html";
    }
    else{
        currentpointId=nextaction;
        renderdialog(currentpointId);
    }
}

//空格键跳转
function handleSpacekey(e){
    const currentpoint=dialogue[currentpointId];
    if(e.code==='Space'&&istypingComplete&&currentpoint.options.length===0){
        e.preventDefault();
        handlejump();
    }
    // 如果文本还在打字中，按空格键可以跳过打字效果
    else if(e.code==='Space'&&!istypingComplete){
        e.preventDefault();
        if(currentTypingTimer) {
            clearInterval(currentTypingTimer);
            currentTypingTimer=null;
        }
        dialogueText.textContent=currentpoint.text;
        istypingComplete=true;
        renderoptions(currentpoint.options);
    }
}

document.addEventListener('keydown',handleSpacekey);

function renderdialog(pointId) {
    const point=dialogue[pointId];
    
    // 清除之前的定时器
    if(currentTypingTimer) {
        clearInterval(currentTypingTimer);
        currentTypingTimer=null;
    }
    
    // 更新人物图像、人物名称和对话文本
    istypingComplete=false;
    optionsContainer.classList.remove('visible');

    if(point.character_image){
        characterImg.src=point.character_image;
        imgContainer.classList.remove('hidden','left','right');
        imgContainer.classList.add(point.character_position || 'left');
    }
    else{
        imgContainer.classList.add('hidden');
    }

    characterName.textContent=point.character_name;
    dialogueText.textContent='';

    let textindex=0;
    currentTypingTimer=setInterval(() => {
        if(textindex<point.text.length){
            dialogueText.textContent+=point.text.charAt(textindex);
            textindex++;
        }
        else{
            clearInterval(currentTypingTimer);
            currentTypingTimer=null;
            istypingComplete=true;
            renderoptions(point.options);
        }
    },120);
}

    function renderoptions(options){
    //清空原有选项按钮
        optionsContainer.innerHTML="";  

    //更新选项按钮
    if(options.length>0){
        options.forEach(option => {
            const btn=document.createElement("button");
            btn.className="options-btn";
            btn.textContent=option.text;
            btn.addEventListener("click",() =>{
                handlejump(option.nextpoint);
        });
        optionsContainer.appendChild(btn);
    });
    }
    else {
        const hint=document.createElement("div");
        hint.className="continue-hint";
        hint.textContent="按空格继续...";
        optionsContainer.appendChild(hint);
    }
    optionsContainer.classList.add('visible');
    }   
    renderdialog(currentpointId);