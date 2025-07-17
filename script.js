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
const clearEntryBtn = document.querySelector("#tr-clear-current-entry");
const clearLastEntryBtn = document.querySelector("#tr-clear-last-entry");
const clearDayBtn = document.querySelector("#tr-clear-day");

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


timestampEntriesArr.forEach(e =>{
    loadEntryInTable(e,timestampDispEl);
});

updateMessage();

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
        timestampEntriesArr.push({timestampLabel: timestampLabelArr.pop(), timestamp: timestampArr.pop()});
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
        const summObj = {};
        const catArr = getCategoriesArr();
        catArr.forEach(e => {
            summObj[e] = 0;
        });
        for(let i=0; i<entriesArr.length; i++){
            summObj[entriesArr[i]["category"]] += entriesArr[i]["duration"];
        };
        trackedDaysArr.push({date: dateInpEl.value, entries: entriesArr, timestamps: timestampEntriesArr, summary: summObj});
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
    } else{
        if(timeInArr.length - timeOutArr.length){
            alert("Incomplete entry")
        } else if(!entriesArr.length){
            alert("Day not tracked");
        } else if(JSON.parse(localStorage.getItem("trackedDays")).lastItem["date"] == dateInpEl.value){
            alert("Day already submitted");
        }
    }
});

clearEntryBtn.addEventListener("click",()=>{
    timeInArr.pop();
    localStorage.setItem("timeIn", JSON.stringify(timeInArr));
    updateMessage();
    updateTable();
});
clearLastEntryBtn.addEventListener("click",()=>{
    if(timeInArr.length){
        alert("Clear current entry first");
    } else {
        entriesArr.pop();
    durationDispEl.innerHTML = "";
        localStorage.setItem("ent", JSON.stringify(entriesArr));
    }
    updateTable();
});
clearDayBtn.addEventListener("click",()=>{
    entriesArr = [];
    localStorage.removeItem("ent");
    updateMessage();
    updateTable();
});

function updateTable(){
    durationDispEl.innerHTML = "";
    console.log(entriesArr)
    for(let i=0; i<entriesArr.length; i++){
        loadEntryInTable(entriesArr[i],durationDispEl);
    }
}
/*
This copy button is removed temporarily from the web-app by making it a comment
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
*/

function logTime(time){
    if(isCurEntComplete() && !entriesArr.length){
        timeInArr.push(time);
        localStorage.setItem("timeIn", JSON.stringify(timeInArr));
    } else if(isCurEntComplete() && entriesArr.length){
        if(toWarTime(entriesArr[entriesArr.length - 1]["timeOut"])<=toWarTime(time)){
            timeInArr.push(time);
            localStorage.setItem("timeIn", JSON.stringify(timeInArr));
        } else {
            alert("Error: Overlapping time");
        }
    } else{
        if(duration(timeInArr[0],time)>=0){
            timeOutArr.push(time);
            taskNameArr.push(taskNameInpEl.value);
            categoryArr.push(categoryInpEl.value);
            const dur = duration(timeInArr[0],timeOutArr[0]);
            entriesArr.push({taskName: taskNameArr.pop(), timeIn: timeInArr.pop(), timeOut: timeOutArr.pop(), category: categoryArr.pop(), duration: dur});
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
    updateMessage();
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
            entriesArr.push({taskName: taskNameArr.pop(), timeIn: timeInArr.pop(), timeOut: timeOutArr.pop(), category: categoryArr.pop(), duration: dur});
            loadEntryInTable(entriesArr[entriesArr.length - 1],durationDispEl);
            localStorage.setItem("ent", JSON.stringify(entriesArr));
            localStorage.setItem("timeIn", JSON.stringify(timeInArr));
        } else {
            alert("Out time can't be zero or negative");
        }
    }
    updateMessage();
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
    const time = `${String(dat.getHours()).padStart(2,"0")}:${String(dat.getMinutes()).padStart(2,"0")}`;
    return time;
}

function toWarTime(time){
    return Number(time.split(":").join(""));
}

function updateMessage(){
    if(timeInArr.length>0){
        messageEl.innerHTML = `Current Entry: since ${timeInArr[0]}`;
        messageEl.classList.remove("green-border");
        messageEl.classList.add("red-border");

    }else {
        messageEl.innerHTML = "Current Entry: none";
        messageEl.classList.remove("red-border");
        messageEl.classList.add("green-border");
    }
    clearEntryBtn.disabled = timeInArr.length>0?false:true;
    clearLastEntryBtn.disabled = entriesArr.length>0 && timeInArr.length==0?false:true;
    clearDayBtn.disabled = entriesArr.length>0?false:true;
}

//navigation menu

const lastDaysLink = document.querySelector("#last-days");
const settingsLink = document.querySelector("#settings");
const homeLink = document.querySelector("#home");
let isLastDaysActive = false;
let isSettingsActive = false;

const mainEl = document.querySelector("main");

//this part will have to shifted to settingsLink event listener when the feature of adding or removing new categories will be added
//The section involving categories will have to be updated for the feature "add or remove category"

//start here
function getCategoriesArr(){
    const categoryInpOptionArr = document.querySelectorAll("option");
    const categoryInpArr = [];
    for(let category of categoryInpOptionArr){
        categoryInpArr.push(category.innerHTML);
    }
    return categoryInpArr;
}
//ends here
const searchBase = [];
for(let category of getCategoriesArr()){
    searchBase.push({category: category, searchArr: JSON.parse(localStorage.getItem(`${category}-textarea`))});
}

homeLink.classList.add("active");

homeLink.addEventListener("click",()=>{
    settingsLink.classList.remove("active");
    lastDaysLink.classList.remove("active");
    homeLink.classList.add("active");
    isLastDaysActive = isSettingsActive = false;
    document.querySelector(".pop-up")?document.querySelector(".pop-up").remove():"";
})

lastDaysLink.addEventListener("click", ()=>{
    if(!isLastDaysActive){
        settingsLink.classList.remove("active");
        homeLink.classList.remove("active");
        lastDaysLink.classList.add("active");
        document.querySelector(".pop-up")?document.querySelector(".pop-up").remove():"";
        const contEl = popUp("Last days",lastDaysLink.id);
        contEl.classList.add("summary");

        const div = document.createElement("div");
        div.classList.add("column");

        const p = document.createElement("p");
        p.innerHTML = "Click on date to view data in detail"
        contEl.parentElement.appendChild(p);

        const dispEl = document.createElement("div");
        contEl.parentElement.appendChild(dispEl);

        const colArr = ["Date", ...getCategoriesArr(), "Total"]
        for(let i=0; i<colArr.length; i++){
            const span = document.createElement("span");
            span.classList.add("cell");
            span.innerHTML = colArr[i];
            div.appendChild(span);
        }
        contEl.appendChild(div);

        for(const day of trackedDaysArr){
            const summaryObj = day["summary"];
            const date = day["date"];
            const values = Object.keys(summaryObj).map(e => summaryObj[e]);
            const total = Object.keys(summaryObj).map(e => summaryObj[e]).reduce((a,b)=> a+b);
            const loadArr = [date, ...values, total];

            const div = document.createElement("div");
            div.classList.add("column");

            for(let i=0; i<loadArr.length; i++){
                const span = document.createElement("span");
                span.classList.add("cell");
                span.innerHTML = loadArr[i];
                div.appendChild(span);
                if(i==0){
                    span.classList.add("header-btn");
                    span.addEventListener("click",()=>{
                        dispEl.innerHTML = "";

                        const div = document.createElement("div");
                        div.innerHTML = `<h3>${date}</h3>`

                        const p1 = document.createElement("p");
                        p1.innerHTML = "Time Tracking";
                        const tableEl1 = document.createElement("table");
                        const tableBodyEl1 = document.createElement("tbody");
                        tableEl1.innerHTML = "<thead><tr><th>Name of the task</th><th>Time-in</th><th>Time-out</th><th>Category</th><th>Duration</th></tr></thead>";
                        day["entries"].forEach(e => loadEntryInTable(e,tableBodyEl1));
                        tableEl1.appendChild(tableBodyEl1);
                        div.appendChild(p1);
                        div.appendChild(tableEl1)
                        dispEl.appendChild(div);

                        
                        const p2 = document.createElement("p");
                        p2.innerHTML = "Moment Tracking";
                        const tableEl2 = document.createElement("table");
                        const tableBodyEl2 = document.createElement("tbody");
                        tableEl2.innerHTML = "<thead><tr><th>Moment</th><th>Timestamp</th></tr></thead>";
                        day["timestamps"].forEach(e => loadEntryInTable(e,tableBodyEl2));
                        tableEl2.appendChild(tableBodyEl2);
                        div.appendChild(p2);
                        div.appendChild(tableEl2)
                        dispEl.appendChild(div);
                    })
                }
            }
            contEl.appendChild(div);
        }
        isLastDaysActive = true;
        isSettingsActive = false;
    }
});

settingsLink.addEventListener("click",()=>{
    if(!isSettingsActive){
        settingsLink.classList.add("active");
        lastDaysLink.classList.remove("active");
        homeLink.classList.remove("active");
        document.querySelector(".pop-up")?document.querySelector(".pop-up").remove():"";
        const contEl = popUp("Settings",settingsLink.id);
        const detailsCont = document.createElement("details");
        detailsCont.classList.add("p-item");
        const summaryCont = document.createElement("summary");
        summaryCont.textContent = "Categories";
        detailsCont.appendChild(summaryCont);
        contEl.appendChild(detailsCont);
        for(let category of getCategoriesArr()){
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            summary.textContent = category;
            details.appendChild(summary);
            detailsCont.appendChild(details);
            const textarea = document.createElement("textarea");
            textarea.id = `${category}-textarea`;
            textarea.value = localStorage.getItem(textarea.id)?JSON.parse(localStorage.getItem(textarea.id)).join(", "):"";
            details.appendChild(textarea);
        }
        
        document.querySelectorAll("textarea").forEach(e => {
            e.addEventListener("input",()=>{
                const valueArr = ((e.value).split(",")).map(e => e.trim());
                localStorage.setItem(e.id,JSON.stringify(valueArr));
            });
        });

        isSettingsActive = true;
        isLastDaysActive = false;
    }
});

taskNameInpEl.addEventListener("input",()=>{
    const searchStr = taskNameInpEl.value;
    for(let list of searchBase){
        if(list["searchArr"]){
            for(let value of list["searchArr"]){
                if(String(value).toLowerCase().includes(String(searchStr).toLowerCase())){
                    categoryInpEl.value = list["category"];
                    return;
                }
            }
        }
    }
});

function popUp(headTxt,id){
    const popUp = document.createElement("section");
    popUp.classList.add("pop-up");
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-btn");
    closeBtn.innerHTML+= `&times;`;
    closeBtn.addEventListener("click",()=>{
        closeBtn.parentElement.remove();
        id.includes("last-days")?isLastDaysActive = false : isSettingsActive = false;
        settingsLink.classList.remove("active");
        lastDaysLink.classList.remove("active");
        homeLink.classList.add("active");
    });
    popUp.appendChild(closeBtn);
    const heading = document.createElement("h2");
    heading.classList.add("pop-up-header");
    heading.textContent = headTxt;
    popUp.appendChild(heading);
    const divCont = document.createElement("div");
    divCont.classList.add("p-cont");
    popUp.appendChild(divCont);
    mainEl.appendChild(popUp);
    return divCont;
};
