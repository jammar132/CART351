/* PLEASE DO NOT CHANGE THIS FRAMEWORK ....
the get requests are all implemented and working ... 
so there is no need to alter ANY of the existing code: 
rather you just ADD your own ... */

window.onload = function () {
  document.querySelector("#queryChoice").selectedIndex = 0;
  // create once (make global so other functions can access)
  window.description = document.querySelector("#Ex4_title");
  window.dataPoints = [];
  // local aliases (still reference window.*)
  let description = window.description;
  let dataPoints = window.dataPoints;

  // /**** GeT THE DATA initially :: default view *******/
  // /*** no need to change this one  **/
  runQueryDefault("onload");

  /***** Get the data from drop down selection ****/
  let querySelectDropDown = document.querySelector("#queryChoice");

  querySelectDropDown.onchange = function () {
    console.log(this.value);
    let copyVal = this.value;
    console.log(copyVal);
    runQuery(copyVal);
  };

  /******************* RUN QUERY***************************  */
  async function runQuery(queryPath) {
    // // //build the url -end point
    const url = `/${queryPath}`;
    try {
      let res = await fetch(url);
      let resJSON = await res.json();
      console.log(resJSON);

      //reset the
      document.querySelector("#childOne").innerHTML = "";
      description.textContent = "";
      document.querySelector("#parent-wrapper").style.background =
        "rgba(51,102,255,.2)";

      switch (queryPath) {
        case "default": {
          displayAsDefault(resJSON);
          break;
        }
        case "one": {
          //sabine done
          displayInCirclularPattern(resJSON);
          break;
        }
        case "two": {
          //sabine done
          displayByGroups(resJSON, "weather", "eventName");
          break;
        }
        /***** TO DO FOR EXERCISE 4 *************************
         ** 1: Once you have implemented the mongodb query in server.py,
         ** you will receive it from the get request (THE FETCH HAS ALREADY BEEN IMPLEMENTED:: SEE ABOVE) 
         ** and will automatically will enter into the correct select case
         **  - based on the value that the user chose from the drop down list...)
         ** You need to design and call a custom display function FOR EACH query that you construct ...
         ** 4 queries - I want 4 UNIQUE display functions - you can use the ones I created
         ** as inspiration ONLY - DO NOT just copy and change colors ... experiment, explore, change ...
         ** you can create your own custom objects - but NO images, video or sound... (will get 0).
         ** bonus: if your visualizations(s) are interactive or animate.
         ****/
        case "three": {
          console.log("three");
          displayPositiveImpactMap(resJSON);
          break;
        }
        case "four": {
          console.log("four");
          displayEventGrid(resJSON);
          break;
        }
        case "five": {
          console.log("five");
          displayMonTueStrengthHistogram(resJSON);
          break;
        }
        case "six": {
          console.log("six");
          displayNegativeWeatherBands(resJSON);
          break;
        }
        default: {
          console.log("default case");
          break;
        }
      } //switch
    } catch (err) {
      console.log(err);
    }
  }
  //will make a get request for the data ...

  /******************* RUN DEFAULT QUERY***************************  */
  async function runQueryDefault(queryPath) {
    // // //build the url -end point
    const url = `/${queryPath}`;
    try {
      let res = await fetch(url);
      let resJSON = await res.json();
      console.log(resJSON);
      displayAsDefault(resJSON);
    } catch (err) {
      console.log(err);
    }
  }
  /*******************DISPLAY AS GROUP****************************/
  function displayByGroups(resultObj, propOne, propTwo) {
    window.dataPoints = [];
    dataPoints = window.dataPoints;
    let finalHeight = 0;
    //order by WEATHER and Have the event names as the color  ....

    //set background of parent ... for fun ..
    document.querySelector("#parent-wrapper").style.background =
      "rgba(51, 153, 102,1)";
    description.textContent = "BY WEATHER AND ALSO HAVE EVENT NAMES {COLOR}";
    description.style.color = "rgb(179, 230, 204)";

    let coloredEvents = {};
    let resultSet = resultObj.results;

    //reget
    let possibleEvents = resultObj.events;
    let possibleColors = [
      "rgb(198, 236, 217)",
      "rgb(179, 230, 204)",
      "rgb(159, 223, 190)",
      "rgb(140, 217, 177)",
      "rgb(121, 210, 164)",
      "rgb(102, 204, 151)",
      "rgb(83, 198, 138)",
      "rgb(64, 191, 125)",
      "rgb(255, 204, 179)",
      "rgb(255, 170, 128)",
      "rgb(255, 153, 102)",
      "rgb(255, 136, 77)",
      "rgb(255, 119, 51)",
      "rgb(255, 102, 26)",
      "rgb(255, 85, 0)",
      "rgb(230, 77, 0)",
      "rgb(204, 68, 0)",
    ];

    for (let i = 0; i < possibleColors.length; i++) {
      coloredEvents[possibleEvents[i]] = possibleColors[i];
    }

    let offsetX = 20;
    let offsetY = 150;
    // find the weather of the first one ...
    let currentGroup = resultSet[0][propOne];
    console.log(currentGroup);
    let xPos = offsetX;
    let yPos = offsetY;

    for (let i = 0; i < resultSet.length - 1; i++) {
      dataPoints.push(
        new myDataPoint(
          resultSet[i].dataId,
          resultSet[i].day,
          resultSet[i].weather,
          resultSet[i].start_mood,
          resultSet[i].after_mood,
          resultSet[i].after_mood_strength,
          resultSet[i].event_affect_strength,
          resultSet[i].event_name,
          //map to the EVENT ...
          coloredEvents[resultSet[i].event_name],
          //last parameter is where should this go...
          document.querySelector("#childOne"),
          //which css style///
          "point_two"
        )
      );

      /** check if we have changed group ***/
      if (resultSet[i][propOne] !== currentGroup) {
        //update
        currentGroup = resultSet[i][propOne];
        offsetX += 150;
        offsetY = 150;
        xPos = offsetX;
        yPos = offsetY;
      }
      // if not just keep on....
      else {
        if (i % 10 === 0 && i !== 0) {
          xPos = offsetX;
          yPos = yPos + 15;
        } else {
          xPos = xPos + 15;
        }
      } //end outer else

      dataPoints[i].update(xPos, yPos);
      finalHeight = yPos;
    } //for

    document.querySelector("#childOne").style.height = `${finalHeight + 20}px`;
  } //function

  /*****************DISPLAY IN CIRCUlAR PATTERN:: <ONE>******************************/
  function displayInCirclularPattern(resultOBj) {
    //reset
    window.dataPoints = [];
    dataPoints = window.dataPoints;
    let xPos = 0;
    let yPos = 0;
    //for circle drawing
    let angle = 0;
    let centerX = window.innerWidth / 2;
    let centerY = 350;

    let scalar = 300;
    let yHeight = Math.cos(angle) * scalar + centerY;

    let resultSet = resultOBj.results;
    let coloredMoods = {};

    let possibleMoods = resultOBj.moods;
    let possibleColors = [
      "rgba(0, 64, 255,.5)",
      "rgba(26, 83, 255,.5)",
      "rgba(51, 102, 255,.7)",
      "rgba(51, 102, 255,.4)",
      "rgba(77, 121,255,.6)",
      "rgba(102, 140, 255,.6)",
      "rgba(128, 159, 255,.4)",
      "rgba(153, 179, 255,.3)",
      "rgba(179, 198, 255,.6)",
      "rgba(204, 217, 255,.4)",
    ];

    for (let i = 0; i < possibleMoods.length; i++) {
      coloredMoods[possibleMoods[i]] = possibleColors[i];
    }

    //set background of parent ... for fun ..
    document.querySelector("#parent-wrapper").style.background =
      "rgba(0, 26, 102,1)";
    description.textContent = "BY AFTER MOOD";
    description.style.color = "rgba(0, 64, 255,.5)";

    for (let i = 0; i < resultSet.length - 1; i++) {
      dataPoints.push(
        new myDataPoint(
          resultSet[i].dataId,
          resultSet[i].day,
          resultSet[i].weather,
          resultSet[i].start_mood,
          resultSet[i].after_mood,
          resultSet[i].after_mood_strength,
          resultSet[i].event_affect_strength,
          resultSet[i].event_name,
          //map to the day ...
          coloredMoods[resultSet[i].after_mood],
          //last parameter is where should this go...
          document.querySelector("#childOne"),
          //which css style///
          "point_two"
        )
      );
      /*** circle drawing ***/
      xPos = Math.sin(angle) * scalar + centerX;
      yPos = Math.cos(angle) * scalar + centerY;
      angle += 0.13;

      if (angle > 2 * Math.PI) {
        angle = 0;
        scalar -= 20;
      }
      dataPoints[i].update(xPos, yPos);
    } //for

    document.querySelector("#childOne").style.height = `${yHeight}px`;
  } //function

  /*****************DISPLAY AS DEFAULT GRID :: AT ONLOAD ******************************/
  function displayAsDefault(resultOBj) {
    //reset
    window.dataPoints = [];
    dataPoints = window.dataPoints;
    let xPos = 0;
    let yPos = 0;
    const NUM_COLS = 50;
    const CELL_SIZE = 20;
    let coloredDays = {};
    let resultSet = resultOBj.results;
    possibleDays = resultOBj.days;
    /*
  1: get the array of days (the second entry in the resultOBj)
  2: for each possible day (7)  - create a key value pair -> day: color and put in the
  coloredDays object
  */
    console.log(possibleDays);
    let possibleColors = [
      "rgb(255, 102, 153)",
      "rgb(255, 77, 136)",
      "rgb(255, 51, 119)",
      "rgb(255, 26, 102)",
      "rgb(255, 0, 85)",
      "rgb(255, 0, 85)",
      "rgb(255, 0, 85)",
    ];

    for (let i = 0; i < possibleDays.length; i++) {
      coloredDays[possibleDays[i]] = possibleColors[i];
    }
/* for through each result
1: create a new MyDataPoint object and pass the properties from the db result entry to the object constructor
2: set the color using the coloredDays object associated with the resultSet[i].day
3:  put into the dataPoints array.
**/
    //set background of parent ... for fun ..
    document.querySelector("#parent-wrapper").style.background =
      "rgba(255,0,0,.4)";
    description.textContent = "DEfAULT CASE";
    description.style.color = "rgb(255, 0, 85)";

    //last  element is the helper array...
    for (let i = 0; i < resultSet.length - 1; i++) {
      dataPoints.push(
        new myDataPoint(
          resultSet[i].dataId,
          resultSet[i].day,
          resultSet[i].weather,
          resultSet[i].start_mood,
          resultSet[i].after_mood,
          resultSet[i].after_mood_strength,
          resultSet[i].event_affect_strength,
          resultSet[i].evnet_name,
          //map to the day ...
          coloredDays[resultSet[i].day],
          //last parameter is where should this go...
          document.querySelector("#childOne"),
          //which css style///
          "point"
        )
      );

      /** this code is rather brittle - but does the job for now .. draw a grid of data points ..
//*** drawing a grid ****/
      if (i % NUM_COLS === 0) {
        //reset x and inc y (go to next row)
        xPos = 0;
        yPos += CELL_SIZE;
      } else {
        //just move along in the column
        xPos += CELL_SIZE;
      }
      //update the position of the data point...
      dataPoints[i].update(xPos, yPos);
    } //for
    document.querySelector("#childOne").style.height = `${yPos + CELL_SIZE}px`;
  } //function

  

  /******************* INFO CARD (click a dot) ****************************/
  function makeInfoCard() {
    let card = document.querySelector("#infoCard");
    if (card) return card;

    card = document.createElement("div");
    card.id = "infoCard";
    card.style.position = "fixed";
    card.style.right = "18px";
    card.style.bottom = "18px";
    card.style.width = "280px";
    card.style.padding = "12px";
    card.style.background = "white";
    card.style.border = "2px solid rgba(255,109,51,.9)";
    card.style.borderRadius = "14px";
    card.style.fontSize = "12px";
    card.style.zIndex = 9999;
    card.style.lineHeight = "1.35";
    card.innerHTML = "<b>Click a dot</b><br>to see details here.";
    document.body.appendChild(card);
    return card;
  }

  function setInfoCardFromDP(dp) {
    const card = makeInfoCard();
    card.innerHTML = `
      <b>#${dp.id}</b><br>
      <b>event</b>: ${dp.event_name}<br>
      <b>day</b>: ${dp.day}<br>
      <b>weather</b>: ${dp.weather}<br>
      <b>start</b>: ${dp.start_mood}<br>
      <b>after</b>: ${dp.after_mood} (strength ${dp.am_strength})<br>
      <b>event affect</b>: ${dp.event_affect_strength}
    `;
  }

  /******************* THREE: Positive AFTER mood → Impact Map ********************/
  function displayPositiveImpactMap(resultObj) {
    window.dataPoints = [];
    dataPoints = window.dataPoints;
    const resultSet = resultObj.results || [];

    const child = document.querySelector("#childOne");
    child.innerHTML = "";

    description.textContent =
      "THREE: Positive AFTER mood → Impact Map (x = after_mood_strength, y = event_affect_strength)";
    description.style.color = "rgba(255, 109, 51, 0.95)";
    document.querySelector("#parent-wrapper").style.background = "rgba(255,109,51,.06)";

    const padL = 90, padR = 50, padT = 60, padB = 70;
    const W = Math.min(window.innerWidth - 80, 980);
    const H = 620;

    child.style.height = `${H + 140}px`;

    const plot = document.createElement("div");
    plot.style.position = "relative";
    plot.style.width = `${W}px`;
    plot.style.height = `${H}px`;
    plot.style.margin = "20px auto";
    plot.style.border = "2px solid rgba(17,17,17,.25)";
    plot.style.borderRadius = "18px";
    plot.style.background = "rgba(255,255,255,.65)";
    plot.style.overflow = "hidden";
    child.appendChild(plot);

    // grid + ticks
    for (let i = 1; i <= 10; i++) {
      const x = padL + ((i - 1) / 9) * (W - padL - padR);
      const y = padT + (1 - (i - 1) / 9) * (H - padT - padB);

      const xt = document.createElement("div");
      xt.textContent = i;
      xt.style.position = "absolute";
      xt.style.left = `${x}px`;
      xt.style.top = `${H - padB + 10}px`;
      xt.style.transform = "translateX(-50%)";
      xt.style.fontSize = "12px";
      xt.style.color = "rgba(17,17,17,.6)";
      plot.appendChild(xt);

      const yt = document.createElement("div");
      yt.textContent = i;
      yt.style.position = "absolute";
      yt.style.left = `${padL - 14}px`;
      yt.style.top = `${y}px`;
      yt.style.transform = "translateY(-50%)";
      yt.style.fontSize = "12px";
      yt.style.color = "rgba(17,17,17,.6)";
      plot.appendChild(yt);

      const vline = document.createElement("div");
      vline.style.position = "absolute";
      vline.style.left = `${x}px`;
      vline.style.top = `${padT}px`;
      vline.style.height = `${H - padT - padB}px`;
      vline.style.borderLeft = "1px dashed rgba(255,109,51,.14)";
      plot.appendChild(vline);

      const hline = document.createElement("div");
      hline.style.position = "absolute";
      hline.style.left = `${padL}px`;
      hline.style.top = `${y}px`;
      hline.style.width = `${W - padL - padR}px`;
      hline.style.borderTop = "1px dashed rgba(255,109,51,.14)";
      plot.appendChild(hline);
    }

    // axis labels
    const xLab = document.createElement("div");
    xLab.textContent = "after_mood_strength →";
    xLab.style.position = "absolute";
    xLab.style.left = "50%";
    xLab.style.bottom = "16px";
    xLab.style.transform = "translateX(-50%)";
    xLab.style.fontSize = "14px";
    xLab.style.color = "rgba(17,17,17,.75)";
    plot.appendChild(xLab);

    const yLab = document.createElement("div");
    yLab.textContent = "event_affect_strength ↑";
    yLab.style.position = "absolute";
    yLab.style.left = "16px";
    yLab.style.top = "50%";
    yLab.style.transform = "translateY(-50%) rotate(-90deg)";
    yLab.style.transformOrigin = "left top";
    yLab.style.fontSize = "14px";
    yLab.style.color = "rgba(17,17,17,.75)";
    plot.appendChild(yLab);

    // tiny hint
    const hint = document.createElement("div");
    hint.textContent = "Tip: dots are jittered inside each (x,y) strength cell to show density.";
    hint.style.position = "absolute";
    hint.style.right = "16px";
    hint.style.top = "14px";
    hint.style.fontSize = "12px";
    hint.style.color = "rgba(17,17,17,.55)";
    plot.appendChild(hint);

    const tip = document.createElement("div");
    tip.style.position = "fixed";
    tip.style.pointerEvents = "none";
    tip.style.padding = "8px 10px";
    tip.style.background = "white";
    tip.style.border = "2px solid rgba(255, 109, 51, 0.9)";
    tip.style.borderRadius = "10px";
    tip.style.fontSize = "12px";
    tip.style.display = "none";
    tip.style.zIndex = 9999;
    document.body.appendChild(tip);

    const innerW = (W - padL - padR);
    const innerH = (H - padT - padB);
    const cellW = innerW / 9; // 10 ticks => 9 gaps
    const cellH = innerH / 9;

    const scaleX = (v) => padL + ((v - 1) / 9) * innerW;
    const scaleY = (v) => padT + (1 - (v - 1) / 9) * innerH;

    // jitter that actually fills the cell, not just a tiny nudge
    const jitterX = () => (Math.random() - 0.5) * cellW * 0.78;
    const jitterY = () => (Math.random() - 0.5) * cellH * 0.78;

    for (let i = 0; i < resultSet.length; i++) {
      const r = resultSet[i];

      const a = Math.max(1, Math.min(10, parseInt(r.after_mood_strength || 1)));
      const e = Math.max(1, Math.min(10, parseInt(r.event_affect_strength || 1)));

      // spread inside the cell
      let xPos = scaleX(a) + jitterX();
      let yPos = scaleY(e) + jitterY();

      // clamp so dots stay inside plot area
      xPos = Math.max(padL + 6, Math.min(W - padR - 6, xPos));
      yPos = Math.max(padT + 6, Math.min(H - padB - 6, yPos));

      const dp = new myDataPoint(
        r.dataId,
        r.day,
        r.weather,
        r.start_mood,
        r.after_mood,
        r.after_mood_strength,
        r.event_affect_strength,
        r.event_name,
        "rgba(255,109,51,.75)",
        plot,
        "point_two"
      );

      // size reflects after mood strength a little
      const sz = 6 + a * 0.9;
      dp.container.style.width = `${sz}px`;
      dp.container.style.height = `${sz}px`;
      dp.container.style.borderRadius = "999px";
      dp.container.style.boxShadow = "0 0 10px rgba(255,109,51,.12)";

      dp.container.addEventListener("mouseenter", () => {
        tip.style.display = "block";
        tip.innerHTML = `
          <b>#${dp.id}</b><br>
          event: ${dp.event_name}<br>
          after: <b>${dp.after_mood}</b> (strength ${dp.am_strength})<br>
          event affect: <b>${dp.event_affect_strength}</b><br>
          day/weather: ${dp.day} / ${dp.weather}
        `;
      });
      dp.container.addEventListener("mousemove", (ev) => {
        tip.style.left = ev.clientX + 14 + "px";
        tip.style.top = ev.clientY + 14 + "px";
      });
      dp.container.addEventListener("mouseleave", () => (tip.style.display = "none"));
      dp.container.addEventListener("click", () => setInfoCardFromDP(dp));

      dp.update(xPos, yPos);
      dataPoints.push(dp);
    }
  }

  /******************* FOUR: All entries sorted by event_name → Event Grid ********/
  function displayEventGrid(resultObj) {
    window.dataPoints = [];
    dataPoints = window.dataPoints;

    const resultSet = resultObj.results || [];
    const child = document.querySelector("#childOne");
    child.innerHTML = "";

    description.textContent = "FOUR: Entries grouped by EVENT (each card = one event)";
    description.style.color = "rgba(255, 109, 51, 0.95)";
    document.querySelector("#parent-wrapper").style.background = "rgba(255,109,51,.05)";

    // group by event_name
    const groups = {};
    for (const r of resultSet) {
      const key = r.event_name || "unknown";
      (groups[key] ||= []).push(r);
    }

    // keep a stable order
    const eventNames = Object.keys(groups).sort((a, b) => a.localeCompare(b));

    // responsive centered grid container
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
    grid.style.columnGap = "32px";
    grid.style.rowGap = "36px";
    grid.style.padding = "24px";
    grid.style.boxSizing = "border-box";
    grid.style.maxWidth = `${Math.min(window.innerWidth - 40, 1240)}px`;
    grid.style.margin = "0 auto";
    grid.style.alignItems = "start";
    child.appendChild(grid);

    function makeCard(title) {
      const card = document.createElement("div");
      card.style.width = "100%";
      card.style.border = "2px dashed rgba(255,109,51,.28)";
      card.style.borderRadius = "16px";
      card.style.background = "rgba(255,255,255,.55)";
      card.style.padding = "12px";
      card.style.minHeight = "240px";
      card.style.position = "relative";
      card.style.overflow = "hidden";

      const t = document.createElement("div");
      t.textContent = title;
      t.style.fontSize = "12px";
      t.style.color = "rgba(255,109,51,.95)";
      t.style.textTransform = "uppercase";
      t.style.letterSpacing = "0.04em";
      t.style.marginBottom = "8px";
      t.style.whiteSpace = "nowrap";
      t.style.overflow = "hidden";
      t.style.textOverflow = "ellipsis";
      card.appendChild(t);

      const canvas = document.createElement("div");
      canvas.style.position = "relative";
      canvas.style.height = "195px";
      canvas.style.borderRadius = "12px";
      canvas.style.background = "rgba(255,109,51,.04)";
      canvas.style.overflow = "hidden"; // hard safety
      card.appendChild(canvas);

      return { card, canvas };
    }

    // Fill each card with dots; wrap + autoscale so nothing overflows
    for (const name of eventNames) {
      const rows = groups[name];
      const { card, canvas } = makeCard(name);
      grid.appendChild(card);

      // Layout constants
      const PAD = 10;
      const CANVAS_H = 195; // must match canvas.style.height
      let CELL = 14;        // spacing step
      let DOT = 10;         // dot size

      // Reliable width AFTER DOM append
      const W = Math.max(200, canvas.clientWidth || canvas.getBoundingClientRect().width || 260);
      const usableW = Math.max(120, W - PAD * 2);

      // initial columns
      let cols = Math.max(1, Math.floor(usableW / CELL));
      let rowsNeeded = Math.ceil(rows.length / cols);

      // autoscale if it doesn't fit vertically
      const usableH = Math.max(80, CANVAS_H - PAD * 2);
      const neededH = rowsNeeded * CELL;

      if (neededH > usableH) {
        const scale = usableH / neededH;          // < 1
        CELL = Math.max(8, Math.floor(CELL * scale));
        DOT = Math.max(6, Math.min(10, CELL - 4));

        cols = Math.max(1, Math.floor(usableW / CELL));
        rowsNeeded = Math.ceil(rows.length / cols);
      }

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];

        // wrapped grid positions
        let x = PAD + (i % cols) * CELL;
        let y = PAD + Math.floor(i / cols) * CELL;

        const maxX = (W - PAD - DOT);
        const maxY = (CANVAS_H - PAD - DOT);
        x = Math.max(PAD, Math.min(x, maxX));
        y = Math.max(PAD, Math.min(y, maxY));

        const dp = new myDataPoint(
          r.dataId, r.day, r.weather, r.start_mood, r.after_mood,
          r.after_mood_strength, r.event_affect_strength, r.event_name,
          "rgba(30,30,30,.75)",
          canvas,
          "point_two"
        );

        // FORCE consistent dot size + correct positioning (beats CSS)
        dp.container.style.position = "absolute";
        dp.container.style.boxSizing = "border-box";
        dp.container.style.setProperty("width", `${DOT}px`, "important");
        dp.container.style.setProperty("height", `${DOT}px`, "important");
        dp.container.style.setProperty("min-width", `${DOT}px`, "important");
        dp.container.style.setProperty("min-height", `${DOT}px`, "important");
        dp.container.style.setProperty("max-width", `${DOT}px`, "important");
        dp.container.style.setProperty("max-height", `${DOT}px`, "important");
        dp.container.style.setProperty("border-radius", "999px", "important");
        dp.container.style.setProperty("transform", "none", "important");
        dp.container.style.opacity = "0.9";

        dp.container.addEventListener("click", () => setInfoCardFromDP(dp));

        dp.update(x, y);
        dataPoints.push(dp);
      }
    }

    child.style.height = "auto";
  }

  /******************* FIVE: Mon/Tue sorted by strength → Two-lane histogram ******/
  function displayMonTueStrengthHistogram(resultObj) {
    window.dataPoints = [];
    dataPoints = window.dataPoints;
    const resultSet = resultObj.results || [];
    const child = document.querySelector("#childOne");
    child.innerHTML = "";

    description.textContent =
      "FIVE: Monday vs Tuesday → event_affect_strength (1–10) distribution (stacked counts)";
    description.style.color = "rgba(255, 109, 51, 0.95)";
    document.querySelector("#parent-wrapper").style.background = "rgba(255,109,51,.05)";

    const W = Math.min(window.innerWidth - 80, 980);
    const H = 640;
    child.style.height = `${H + 120}px`;

    const wrap = document.createElement("div");
    wrap.style.position = "relative";
    wrap.style.width = `${W}px`;
    wrap.style.height = `${H}px`;
    wrap.style.margin = "20px auto";
    wrap.style.border = "2px solid rgba(17,17,17,.25)";
    wrap.style.borderRadius = "18px";
    wrap.style.background = "rgba(255,255,255,.65)";
    wrap.style.overflow = "hidden";
    child.appendChild(wrap);

    const padL = 120, padR = 40, padT = 60, padB = 70;
    const innerW = W - padL - padR;

    // two panels
    const panelGap = 30;
    const panelH = (H - padT - padB - panelGap) / 2;

    const mondayTop = padT;
    const tuesdayTop = padT + panelH + panelGap;

    const baselineOffset = 22; // space from bottom of panel
    const mondayBaseY = mondayTop + panelH - baselineOffset;
    const tuesdayBaseY = tuesdayTop + panelH - baselineOffset;

    const binW = innerW / 10;
    const dot = 10;
    const xPad = 10;
    const maxStackCols = Math.max(1, Math.floor((binW - xPad * 2) / (dot + 2)));
    const stepX = dot + 2;
    const stepY = dot + 2;

    // Titles
    function panelTitle(txt, top) {
      const d = document.createElement("div");
      d.textContent = txt;
      d.style.position = "absolute";
      d.style.left = "18px";
      d.style.top = `${top - 34}px`;
      d.style.fontSize = "14px";
      d.style.color = "rgba(17,17,17,.7)";
      d.style.textTransform = "uppercase";
      wrap.appendChild(d);
    }
    panelTitle("Monday", mondayTop);
    panelTitle("Tuesday", tuesdayTop);

    // Axis label
    const xLab = document.createElement("div");
    xLab.textContent = "event_affect_strength → (1 = low, 10 = high)";
    xLab.style.position = "absolute";
    xLab.style.left = "50%";
    xLab.style.bottom = "16px";
    xLab.style.transform = "translateX(-50%)";
    xLab.style.fontSize = "14px";
    xLab.style.color = "rgba(17,17,17,.75)";
    wrap.appendChild(xLab);

    // Guides + x ticks
    for (let i = 1; i <= 10; i++) {
      const x = padL + (i - 1) * binW;

      const guide = document.createElement("div");
      guide.style.position = "absolute";
      guide.style.left = `${x}px`;
      guide.style.top = `${padT}px`;
      guide.style.width = `${binW}px`;
      guide.style.height = `${H - padT - padB}px`;
      guide.style.borderLeft = "1px dashed rgba(255,109,51,.12)";
      wrap.appendChild(guide);

      const xl = document.createElement("div");
      xl.textContent = i;
      xl.style.position = "absolute";
      xl.style.left = `${x + binW / 2}px`;
      xl.style.bottom = "40px";
      xl.style.transform = "translateX(-50%)";
      xl.style.fontSize = "12px";
      xl.style.color = "rgba(17,17,17,.65)";
      wrap.appendChild(xl);
    }

    // baselines
    function baseline(y) {
      const l = document.createElement("div");
      l.style.position = "absolute";
      l.style.left = `${padL}px`;
      l.style.top = `${y}px`;
      l.style.width = `${innerW}px`;
      l.style.borderTop = "2px solid rgba(17,17,17,.18)";
      wrap.appendChild(l);
    }
    baseline(mondayBaseY);
    baseline(tuesdayBaseY);

    // bins
    const bins = {
      Monday: Array.from({ length: 10 }, () => []),
      Tuesday: Array.from({ length: 10 }, () => []),
    };

    for (const r of resultSet) {
      if (r.day !== "Monday" && r.day !== "Tuesday") continue;
      const s = Math.max(1, Math.min(10, parseInt(r.event_affect_strength || 1)));
      bins[r.day][s - 1].push(r);
    }

    function drawCountsLabel(day, baseY) {
      for (let s = 1; s <= 10; s++) {
        const count = bins[day][s - 1].length;
        const x = padL + (s - 1) * binW + binW / 2;

        const c = document.createElement("div");
        c.textContent = count;
        c.style.position = "absolute";
        c.style.left = `${x}px`;
        c.style.top = `${baseY + 10}px`;
        c.style.transform = "translateX(-50%)";
        c.style.fontSize = "11px";
        c.style.color = "rgba(17,17,17,.45)";
        wrap.appendChild(c);
      }
    }
    drawCountsLabel("Monday", mondayBaseY);
    drawCountsLabel("Tuesday", tuesdayBaseY);

    function place(day, baseY, color) {
      for (let s = 1; s <= 10; s++) {
        const group = bins[day][s - 1];
        const xBase = padL + (s - 1) * binW + xPad;

        for (let i = 0; i < group.length; i++) {
          const r = group[i];

          const col = i % maxStackCols;
          const row = Math.floor(i / maxStackCols);

          const xPos = xBase + col * stepX;
          const yPos = baseY - dot - row * stepY; // stack UP

          const dp = new myDataPoint(
            r.dataId, r.day, r.weather, r.start_mood, r.after_mood,
            r.after_mood_strength, r.event_affect_strength, r.event_name,
            color, wrap, "point_two"
          );

          dp.container.style.width = `${dot}px`;
          dp.container.style.height = `${dot}px`;
          dp.container.style.borderRadius = "4px";
          dp.container.style.opacity = "0.92";

          dp.container.addEventListener("click", () => setInfoCardFromDP(dp));

          dp.update(xPos, yPos);
          dataPoints.push(dp);
        }
      }
    }

    place("Monday", mondayBaseY, "rgba(255,109,51,.75)");
    place("Tuesday", tuesdayBaseY, "rgba(30,30,30,.70)");
  }

  /******************* SIX: Negative start + negative after → Weather bands ********/
  function displayNegativeWeatherBands(resultObj) {
    window.dataPoints = [];
    dataPoints = window.dataPoints;
    const resultSet = resultObj.results || [];

    const child = document.querySelector("#childOne");
    child.innerHTML = "";

    description.textContent =
      "SIX: Negative start + negative after → grouped by weather (each row = weather)";
    description.style.color = "rgba(255, 109, 51, 0.95)";
    document.querySelector("#parent-wrapper").style.background = "rgba(0,0,0,.03)";

    // group by weather
    const groups = {};
    for (const r of resultSet) {
      const w = r.weather || "unknown";
      (groups[w] ||= []).push(r);
    }
    const weathers = Object.keys(groups);

    const W = Math.min(window.innerWidth - 80, 980);
    const padL = 170, padR = 40;
    const bandH = 74;

    const H = Math.max(520, weathers.length * bandH + 120);
    child.style.height = `${H}px`;

    const wrap = document.createElement("div");
    wrap.style.position = "relative";
    wrap.style.width = `${W}px`;
    wrap.style.height = `${H - 60}px`;
    wrap.style.margin = "20px auto";
    wrap.style.border = "2px solid rgba(17,17,17,.25)";
    wrap.style.borderRadius = "18px";
    wrap.style.background = "rgba(255,255,255,.70)";
    child.appendChild(wrap);

    let y = 50;

    for (let wi = 0; wi < weathers.length; wi++) {
      const w = weathers[wi];
      const rows = groups[w];

      const band = document.createElement("div");
      band.style.position = "absolute";
      band.style.left = "0px";
      band.style.top = `${y}px`;
      band.style.width = "100%";
      band.style.height = `${bandH}px`;
      band.style.borderTop = "1px dashed rgba(255,109,51,.18)";
      band.style.background = wi % 2 === 0 ? "rgba(255,109,51,.04)" : "rgba(0,0,0,.03)";
      wrap.appendChild(band);

      const lab = document.createElement("div");
      lab.textContent = w.toUpperCase();
      lab.style.position = "absolute";
      lab.style.left = "18px";
      lab.style.top = `${y + 26}px`;
      lab.style.fontSize = "13px";
      lab.style.color = "rgba(17,17,17,.70)";
      wrap.appendChild(lab);

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const xPos =
          padL +
          (i / Math.max(1, rows.length - 1)) * (W - padL - padR) +
          (Math.random() - 0.5) * 10;
        const yPos = y + 10 + Math.random() * (bandH - 20);

        const dp = new myDataPoint(
          r.dataId, r.day, r.weather, r.start_mood, r.after_mood,
          r.after_mood_strength, r.event_affect_strength, r.event_name,
          "rgba(30,30,30,.75)",
          wrap,
          "point_two"
        );

        dp.container.style.width = "10px";
        dp.container.style.height = "10px";
        dp.container.style.borderRadius = "999px";
        dp.container.style.opacity = "0.9";

        let pinned = false;
        dp.container.addEventListener("click", () => {
          pinned = !pinned;
          dp.container.style.border = pinned ? "2px solid rgba(255,109,51,.95)" : "none";
          setInfoCardFromDP(dp);
        });

        dp.update(xPos, yPos);
        dataPoints.push(dp);
      }

      y += bandH;
    }
  }
/***********************************************/
};