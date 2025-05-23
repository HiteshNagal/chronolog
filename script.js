//references for html elements
    //references for day tracker
const taskNameInpEl = document.querySelector("#tr-name-inp");
const categoryInpEl = document.querySelector("#tr-category-inp");
const timeInpEl = document.querySelector("#tr-time-inp");
const timeInpLogBtn = document.querySelector("#tr-time-inp-log-btn");
const timeInpStopBtn = document.querySelector("#tr-time-inp-stop-btn");
const timeCurrLogBtn = document.querySelector("#tr-time-curr-log-btn");
const timeCurrStopBtn = document.querySelector("#tr-time-curr-stop-btn");
    //refrences for timestamp tracker
const timestampInpEl = document.querySelector("#tr-timestamp-inp");
const timestampLabelInpEl = document.querySelector("#tr-timestamp-label-inp");
const timestampLogBtn = document.querySelector("#tr-timestamp-inp-log-btn");

    //references for date input and submit button
const dateInpEl = document.querySelector("#tr-date-inp");
const submitBtn = document.querySelector("#tr-submit");
const copyBtn = document.querySelector("#tr-copy");

const messageEl = document.querySelector("#tr-message");

//variables for day tracker
let timeInArr = JSON.parse(localStorage.getItem("timeIn")) || [];
let entriesArr = JSON.parse(localStorage.getItem("ent")) || [];
let dateToday = localStorage.getItem("date") || "";
const trackedDaysArr = JSON.parse(localStorage.getItem("trackedDays")) || [];
let timeOutArr = [];
let taskNameArr = [];
let categoryArr = [];
let durationArr = [];

let isCurEntComplete = ()=> !(timeInArr.length - timeOutArr.length);
let isTaskNameEmpty = ()=> taskNameInpEl.value.length>0?false:true;
//variabls for timestamp tracker
const timestampArr =[];
const timestampLabelArr =[];

let timestampEntriesArr = JSON.parse(localStorage.getItem("tmst")) || [];

let isTimestampNameEmpty = ()=> timestampLabelInpEl.value.length>0?false:true;

const timestampDispEl = document.querySelector("#tr-timestamp");
const durationDispEl = document.querySelector("#tr-duration");

//set value for date input element
dateInpEl.value = dateToday || getDateYMD();

//event listeners to enable buttons on providing input in element
timeInpEl.addEventListener("input", ()=>{
        timeInpLogBtn.disabled = false;
        timeInpStopBtn.disabled = false;
});
timestampInpEl.addEventListener("input", ()=>{
    timestampLogBtn.disabled = false;
});

//evenet listener for date input element changes
dateInpEl.addEventListener("input", ()=>{
    localStorage.setItem("date", dateInpEl.value);
});

entriesArr.forEach(e =>{
    loadEntryInTable(e,durationDispEl);
});

messageEl.innerHTML = timeInArr.length>0?`Current Entry: since ${timeInArr[0]}`:"Nothing in queue";

timestampEntriesArr.forEach(e =>{
    loadEntryInTable(e,timestampDispEl);
});


timeInpLogBtn.addEventListener("click",()=>{
    if(!isTaskNameEmpty()){
        logTime(timeInpEl.value);
    } else {
        alert("Provide name of the task")
    } 
});

timeCurrLogBtn.addEventListener("click",()=>{
    if(!isTaskNameEmpty()){
        logTime(getTimeHM());
    } else {
        alert("Provide name of the task")
    }
});

timeInpStopBtn.addEventListener("click",()=>{
    if(!isTaskNameEmpty()){
        stopTime(timeInpEl.value);
    } else {
        alert("Provide name of the task")
    }
});

timeCurrStopBtn.addEventListener("click", ()=>{
    if(!isTaskNameEmpty()){
        stopTime(getTimeHM());
    } else {
        alert("Provide name of the task")
    }
});

timestampLogBtn.addEventListener("click",(e)=>{
    if(!isTimestampNameEmpty()){
        timestampArr.push(timestampInpEl.value);
        timestampLabelArr.push(timestampLabelInpEl.value);
        timestampEntriesArr.push({timestamp: timestampArr.pop(), timestampLabel: timestampLabelArr.pop()});
        loadEntryInTable(timestampEntriesArr[timestampEntriesArr.length - 1],timestampDispEl);
        timestampInpEl.value = "";
        timestampLabelInpEl.value = "";
        timestampLogBtn.disabled = true;
        localStorage.setItem("tmst",JSON.stringify(timestampEntriesArr));
    } else{
        alert("Provide label")
    }
});

submitBtn.addEventListener("click",()=>{
    if(entriesArr.length && !(timeInArr.length - timeOutArr.length)){
        trackedDaysArr.push({date: dateInpEl.value, entries: entriesArr, timestamps: timestampEntriesArr});
        entriesArr = [];
        timeInArr = [];
        timeOutArr = [];
        taskNameArr = [];
        categoryArr = [];
        durationArr = [];
        timestampEntriesArr = [];
        localStorage.clear();
        durationDispEl.innerHTML = "";
        timestampDispEl.innerHTML = "";
        localStorage.setItem("trackedDays", JSON.stringify(trackedDaysArr));
        copyBtn.disabled = false;
    } else{
        alert("Track the day first to submit")
    }
});
copyBtn.addEventListener("click",()=>{
    const strArr = trackedDaysArr[trackedDaysArr.length - 1]["entries"];
    let str = "Name of the task,Time-in,Time-out,Category,Duration\n";
    for(let entry of strArr){
        for(let ent in entry){
            str += `${entry[ent]},`;
        }
        str = str.slice(0, str.length - 1)
        str += "\n";
    }
    console.log(str, strArr);
    navigator.clipboard.writeText(str);
});

function logTime(time){
    if(isCurEntComplete() && !entriesArr.length){
        timeInArr.push(time);
    } else if(isCurEntComplete() && entriesArr.length){
        if(toWarTime(entriesArr[entriesArr.length - 1]["timeOut"])<=toWarTime(time)){
            timeInArr.push(time);
        } else {
            alert("Error: Overlapping time");
        }
    } else{
        if(duration(timeInArr[0],time)>=0){
            timeOutArr.push(time);
            taskNameArr.push(taskNameInpEl.value);
            categoryArr.push(categoryInpEl.value);
            const dur = duration(timeInArr[0],timeOutArr[0]);
            entriesArr.push({taskName: taskNameArr.pop(), timeIn: timeInArr.pop(), timeOut: timeOutArr.pop(), cateogory: categoryArr.pop(), duration: dur});
            loadEntryInTable(entriesArr[entriesArr.length - 1],durationDispEl);
            timeInArr.push(time);
            localStorage.setItem("ent", JSON.stringify(entriesArr));
            localStorage.setItem("timeIn", JSON.stringify(timeInArr));
        } else{
            alert("Error: Overlapping times");
        }
    }
    timeInpLogBtn.disabled = true;
    timeInpStopBtn.disabled = true;
}

function stopTime(time){
    if(isCurEntComplete()){
        alert("Start a task first");
    } else {
        if(duration(timeInArr[0],time)>=0){
            timeOutArr.push(time);
            taskNameArr.push(taskNameInpEl.value);
            categoryArr.push(categoryInpEl.value);
            taskNameInpEl.value = "";
            timeInpEl.value = "";
            timeInpLogBtn.disabled = true;
            timeInpStopBtn.disabled = true;
            const dur = duration(timeInArr[0],timeOutArr[0]);
            entriesArr.push({taskName: taskNameArr.pop(), timeIn: timeInArr.pop(), timeOut: timeOutArr.pop(), cateogory: categoryArr.pop(), duration: dur});
            loadEntryInTable(entriesArr[entriesArr.length - 1],durationDispEl);
            localStorage.setItem("ent", JSON.stringify(entriesArr));
            localStorage.setItem("timeIn", JSON.stringify(timeInArr));
        } else {
            alert("Out time can't be zero or negative");
        }
    }
}

function duration(timeIn, timeOut){
    const tIArr = timeIn.split(":");
    const tOArr = timeOut.split(":");
    const tI = Number(tIArr[0]) + Number(tIArr[1])/60;
    const tO = Number(tOArr[0]) + Number(tOArr[1])/60;
    const duration = Math.round((tO - tI)*100)/100;
    return duration;
}


function loadEntryInTable(obj,el){
    const tr = document.createElement("tr");
    for(let data in obj){
        const td = document.createElement("td");
        td.textContent = obj[data];
        tr.appendChild(td);
    }
    el.appendChild(tr);
}


function getDateYMD(){
    const dat = new Date();
    return (dat).getFullYear()+"-"+String((dat).getMonth()+1).padStart(2,0)+"-"+String((dat).getDate()).padStart(2,0);
}

function getTimeHM(){
    const dat = new Date();
    const time = `${dat.getHours()}:${dat.getMinutes()}`;
    return time;
}

function toWarTime(time){
    return Number(time.split(":").join(""));
}