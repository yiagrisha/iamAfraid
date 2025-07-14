   let canvas
   let starterText = "I'm\nafraid"

   let fonts = []
   let font
   let fontsBytes = []
   let openTypeFonts = []
   let OpenTypeFont

   let fontTypes = document.querySelectorAll('.select .options input')
   let selectedType
   
   let colorSet = ["f94144","f3722c","f8961e","f9844a","f9c74f","90be6d","43aa8b","4d908e","577590","277da1"]
   let cols = []
   
   let textElement = document.querySelector('#preview #text')
   let textContainer = document.querySelector('#preview #container')
   let screen = document.querySelector('#preview')
   let userInput = document.querySelector('#text-input textarea')
   let msgContent = userInput.value
   let containerWidth = document.querySelector('#font-size input')

   let currentFontSize

   let angle = 0

   let alignTabs = document.querySelectorAll('#text-align .radios .radio input')
   let alignOptions = ['left', 'center', 'right', 'justify']
   let selectedAlign 

   let FPC

   function preload() {
      const fontPaths = [
         'Materials/Montserrat-Regular.ttf',
         'Materials/Amarante/Amarante-regular.ttf',
         'Materials/Press_Start_2P/PressStart2P-Regular.ttf',
         'Materials/NotoSansJP-VariableFont_wght.ttf',
         'Materials/Faculty_Glyphic/FacultyGlyphic-Regular.ttf'
      ]
      for(let i = 0; i < fontPaths.length; i++) {
         fonts[i] = loadFont(fontPaths[i])
         fontsBytes[i] = loadBytes(fontPaths[i])
      }
   }

   function setup() {
      let container = document.querySelector('#canvas')
      canvas = createCanvas(container.offsetWidth, container.offsetHeight, WEBGL)
      canvas.parent(container)

      angleMode(DEGREES)
      
      userInput.value = starterText

      for(let i = 0; i < fontsBytes.length; i++) {
         openTypeFonts[i] = opentype.parse(fontsBytes[i].bytes.buffer)
      }
      font = fonts[0]
      OpenTypeFont = openTypeFonts[0]
      
      for (let i = 0; i < fontTypes.length; i++) {
         fontTypes[i].addEventListener('change', function(event) {
            if(event.target.checked) {
               font = fonts[i]
               OpenTypeFont = openTypeFonts[i]

               fontName = ['Montserrat', 'Amarante', 'Press_Start_2P', 'NotoSansJP', 'Faculty_Glyphic'][i]
               textElement.style.fontFamily = fontName
            }
            updateContainerWidth()
            updateFontSize()
         })
      }

      for (let i = 0; i < alignTabs.length; i++) {
         alignTabs[i].addEventListener('change', function(event) {
            if(event.target.checked) {
               selectedAlign = alignOptions[i]
               textElement.style.textAlign = selectedAlign
            }
            updateContainerWidth()
         })
      }

      function updateContainerWidth() {
         textContainer.style.width = containerWidth.value + '%'
         updateFontSize()
      }
      updateContainerWidth()
      
      function updateFontSize() {
         textElement.innerText = userInput.value
         msgContent = userInput.value.match(/[^\r\n]+/g)

         if(textElement.offsetHeight > textContainer.offsetHeight) {
            let b = 0
            let t = 400
         
            while(t-b > 0.05) {
               let m = (b+t)/2
               textElement.style.fontSize = m + 'px'
               currentFontSize = m
            
               if(textElement.offsetHeight <= textContainer.offsetHeight) {
                  b = m
               } else {
                  t = m
               }
            } 
         } else {
            let l = 0
            let r = 400
         
            while(r-l > 0.05) {
               let m = (l+r)/2
               textElement.style.fontSize = m + 'px'
               currentFontSize = m
            
               if(textElement.offsetWidth < textContainer.offsetWidth) {
                  l = m
               } else {
                  r = m
               }
            }
         }
         FPC = updateTextLayout()
      }
      
      userInput.addEventListener('input', updateFontSize)
      window.addEventListener('resize', updateFontSize)
      containerWidth.addEventListener('input', updateContainerWidth)

      function updateTextLayout() {  
         let allComands = []

         let align = selectedAlign

         let lines = userInput.value.split('\n')
         let lineHeight = currentFontSize 
         let font = OpenTypeFont

         let containerOffsetWidth = 0
         let containerOffsetHeight = lines.length * lineHeight
         let baselineShift = lineHeight/5

         for(let i = 0; i < lines.length; i++) {
            let lineWidth = font.getAdvanceWidth(lines[i], currentFontSize)
            if(containerOffsetWidth < lineWidth) {containerOffsetWidth = lineWidth}
         }
         
         for(let i = 0; i < lines.length; i++) {
            let lineWidth = font.getAdvanceWidth(lines[i], currentFontSize)

            let lineOffsetY = lineHeight * (i+1)
            let lineOffsetX = 0
            if(align === 'center') {
               lineOffsetX = (containerOffsetWidth - lineWidth) / 2
            } else if(align === 'right') {
               lineOffsetX = containerOffsetWidth - lineWidth
            }   

            let words = lines[i].split(' ')
            let gaps = words.length - 1
            let extraSpace = 0
            if(align === 'justify') {
               let totalWordWidth = 0
               for (let j = 0; j < words.length; j++) {
                  totalWordWidth += font.getAdvanceWidth(words[j], currentFontSize)
               }
               extraSpace = gaps > 0 ? (containerOffsetWidth - totalWordWidth) / gaps : 0
            }
            
            let charOffsetX = 0
            for(let j = 0; j < words.length; j++) {
               let word = words[j].split('')

               for(let k = 0; k < word.length; k++) {
                  let charWidth = font.getAdvanceWidth(word[k], currentFontSize)
                  let path = font.getPath(word[k], 0, 0, currentFontSize)

                  let overallOffsetX = -(containerOffsetWidth/2) + lineOffsetX + charOffsetX
                  let overallOffsetY = -(containerOffsetHeight/2) + lineOffsetY - baselineShift
                  
                  const shifted = path.commands.map(cmd => {
                     const c = {...cmd}
                     if (c.x !== undefined)  c.x  += overallOffsetX
                     if (c.y !== undefined)  c.y  += overallOffsetY
                     if (c.x1 !== undefined) c.x1 += overallOffsetX
                     if (c.y1 !== undefined) c.y1 += overallOffsetY
                     if (c.x2 !== undefined) c.x2 += overallOffsetX
                     if (c.y2 !== undefined) c.y2 += overallOffsetY
                     return c
                  })
                  allComands.push(...shifted)

                  charOffsetX += charWidth
               }

               if(j < words.length - 1) {
                  charOffsetX += extraSpace + font.getAdvanceWidth(' ', currentFontSize)
               }
            }
         }
         return allComands
      }
      FPC = updateTextLayout() 
   }
   
   function quadLerp(a, b, c, t) {
      return (1 - t)**2 * a + 2 * (1 - t) * t * b + t**2 * c;
   }
   function generateColors() {
      for (let i = 0; i < FPC.length; i++) {
         cols[i] = round(random(colorSet.length - 1))
      }
   }

   let period = 180
   let maxExtrusion = 100
   function easeInOutQuint (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
   }

   function draw() {
      background(255,224,135)
      
      let t = angle % period     // t от 0 до 1
      let progress = (t / period) * 2
      if (progress > 1) progress = 2 - progress // Reversing phase

      let extru = easeInOutQuint(progress, 0, maxExtrusion, 1)  
      

      if (progress === 0) {
         generateColors()
      }
     

      

      let res = 5
      let closePoint = 0;


      for (let i = 0; i < FPC.length; i++) {
         fill(`#${colorSet[cols[i]]}`)

         if (FPC[i].type == "M") {
         }

         if (FPC[i].type == "Z") {
         beginShape(TRIANGLE_STRIP);
            vertex(FPC[i - 1].x, FPC[i - 1].y, -extru);
            vertex(FPC[i - 1].x, FPC[i - 1].y, extru);

            vertex(FPC[closePoint].x, FPC[closePoint].y, -extru);
            vertex(FPC[closePoint].x, FPC[closePoint].y, extru);
         endShape();

         closePoint = i + 1;
         }

         if (FPC[i].type == "L") {
         beginShape(TRIANGLE_STRIP);
            vertex(FPC[i - 1].x, FPC[i - 1].y, -extru);
            vertex(FPC[i - 1].x, FPC[i - 1].y, extru);

            vertex(FPC[i].x, FPC[i].y, -extru);
            vertex(FPC[i].x, FPC[i].y, extru);
         endShape();
         }
         
         if (FPC[i].type == "Q") {
         beginShape(TRIANGLE_STRIP);
            for(let r = 0; r < res; r++){
               let thisT = r/(res - 1);
               let thisX = quadLerp(FPC[i - 1].x, FPC[i].x1, FPC[i].x, thisT);
               let thisY = quadLerp(FPC[i - 1].y, FPC[i].y1, FPC[i].y, thisT);

               vertex(thisX, thisY, -extru);
               vertex(thisX, thisY, extru);
            }
         endShape();
         }

         if (FPC[i].type == "C") {
         beginShape(TRIANGLE_STRIP);
            for(let r = 0; r < res; r++){
               let thisT = r/(res - 1);
               let thisX = bezierPoint(FPC[i - 1].x, FPC[i].x1, FPC[i].x2, FPC[i].x, thisT);
               let thisY = bezierPoint(FPC[i - 1].y, FPC[i].y1, FPC[i].y2, FPC[i].y, thisT);

               vertex(thisX, thisY, -extru);
               vertex(thisX, thisY, extru);
            }
         endShape();
         } 
      }


      for (let m = 0; m < 2; m++) {
         translate(0, 0, m * extru)
         noStroke(0)

         if (m == 0) continue

         for (let j = 0; j < 2; j++) {
            let openContour = false
            /* if(j == 1){
               strokeWeight(2);
               noStroke(0);
               //noFill();
               //translate(0, 0, -50);
            } else {
               noStroke();
               fill(255,110,10)
            } */
            noStroke();
            fill(255,110,10)

            closePoint = 0
            for (i = 0; i < FPC.length; i++) {
               if (FPC[i].type == "M") {
                  if(i > 0){
                     beginContour();
                     openContour = true;
                  } else {
                     beginShape(TESS);
                  }
                  vertex(FPC[i].x, FPC[i].y);
               }
            
               if (FPC[i].type == "Z") {
                  if(openContour){
                     endContour();
                  }
                  if(i == FPC.length - 1){
                     endShape(CLOSE);
                  }
                  closePoint = i + 1;
               }
            
               if (FPC[i].type == "L") {
                  vertex(FPC[i].x, FPC[i].y);
               }
      
               if (FPC[i].type == "Q") {
                  quadraticVertex(FPC[i].x1, FPC[i].y1, FPC[i].x, FPC[i].y);
               }
      
               if (FPC[i].type == "C") {
                  bezierVertex(FPC[i].x1, FPC[i].y1, FPC[i].x2, FPC[i].y2, FPC[i].x, FPC[i].y);
                  vertex(FPC[i].x, FPC[i].y);
               }
            }
         }
      }
      angle++

   }

   function windowResized() {
      let container = document.querySelector('#canvas')
      resizeCanvas(container.offsetWidth, container.offsetHeight)
   }