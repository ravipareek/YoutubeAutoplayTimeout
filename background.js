endTime = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 'START_TIMER') {
  	duration = request.duration;
  	setAutoplay(true, duration, new Date().getTime())
  }
  else if (request.cmd === 'GET_TIME') {
    sendResponse({ time:  endTime});
  }
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    getAutoplaySavedSetting((autoplayValue) => {
    	console.log(autoplayValue);
    	getAutoplayTimerSetting((duration) => {
    		getAutoplayTimerStartSetting((startTime) =>{
	      		var actualAutoplay = autoplayValue;
	      		var actualTimer = duration;
	      		var actualStart = startTime;
				if(autoplayValue==null) {
					actualAutoplay=true;
					setAutoplaySavedSetting(true);
				}
				if(duration==null) {
					actualTimer="";
					setAutoplayTimerSetting("");
				}
				if(startTime==null) {
					actualStart = new Date().getTime();
					setAutoplayTimerStartSetting(actualStart);
				}
				if (autoplayValue)
					setAutoplay(actualAutoplay, actualTimer, actualStart, tabId);
			});
      	});
      });
  }
});


function getAutoplaySavedSetting(callback) {
  chrome.storage.sync.get("autoplayDisabled", (items) => {
    callback(chrome.runtime.lastError ? null : items["autoplayDisabled"]);
  });
}

function setAutoplaySavedSetting(value) {
  var items = {};
  items["autoplayDisabled"] = value;
  
  chrome.storage.sync.set(items);
}

function getAutoplayTimerSetting(callback) {
  chrome.storage.sync.get("autoplayTimer", (items) => {
    callback(chrome.runtime.lastError ? null : items["autoplayTimer"]);
  });
}

function setAutoplayTimerSetting(value) {
  var items = {};
  items["autoplayTimer"] = value;
  
  chrome.storage.sync.set(items);
}

function getAutoplayTimerStartSetting(callback) {
  chrome.storage.sync.get("autoplayStartTimer", (items) => {
    callback(chrome.runtime.lastError ? null : items["autoplayStartTimer"]);
  });
}

function setAutoplayTimerStartSetting(value) {
  var items = {};
  items["autoplayStartTimer"] = value;
  
  chrome.storage.sync.set(items);
}

function setAutoplay(value, timer, start, tabId) {
	if (!value){
		console.log("Setting autoplay to " + value);
		try{
			clearInterval(timeout)
			timeout = null;
		}
		catch{}
	}
	else{
		if (timer != ""){
			let duration = parseInt(timer) * 60000;
			let currentTime = start
			endTime = new Date(currentTime + duration).getTime()

			console.log("Starting " + duration + " millisecond countdown")
			timeout = setInterval(function() {
				let currentTime = new Date().getTime();
				let diff = Math.floor((endTime - currentTime)/1000);
				let diffText = formatTimeLeft(diff);

				if (diff < 0){
					clearInterval(timeout);
					setAutoplaySavedSetting(false);
					console.log("Setting autoplay to " + value + " after " + timer + " minutes");

					// copied
					var script = 'var wantDisabled='+value+'; var autoplayButton = document.getElementById("toggle");if(($("#toggle").attr("checked")==\'checked\' && wantDisabled)||($("#toggle").attr("checked")!=\'checked\' && !wantDisabled)){autoplayButton.click();console.log($("#toggle").attr("checked"));}';

					script += 'var wantDisabled='+value+'; var autoplayButton = document.getElementById("improved-toggle");if(($("#improved-toggle").attr("checked")==\'checked\' && wantDisabled)||($("#improved-toggle").attr("checked")!=\'checked\' && !wantDisabled)){autoplayButton.click();console.log($("#improved-toggle").attr("checked"));}';

					chrome.tabs.executeScript(tabId, { file: "jquery-3.2.1.min.js" }, function() {
						chrome.tabs.executeScript({
						  code: script
						});
					});
				}
			}, 1000);
		}
		else{
			console.log("Setting autoplay to " + value);
		}
	}
}

// sent in seconds
function formatTimeLeft(time) {
	let hours = Math.floor(time/3600);
	let minutes = Math.floor((time%3600)/60);
	let seconds = Math.floor(time%60);

	return `${leadingZero(hours)}:${leadingZero(minutes)}:${leadingZero(seconds)}`;
}

function leadingZero(num) {
    var s = num+"";
    while (s.length < 2) s = "0" + s;
    return s;
}