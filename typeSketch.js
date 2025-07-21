   let canvas
   let starterText = "I'm\nafraid"

   let screen = document.querySelector('#preview')
   let textContainer = document.querySelector('#preview #container')
   let textElement = document.querySelector('#preview #text')
   
   let colorSet2 = ["f94144","f3722c","f8961e","f9844a","f9c74f","90be6d","43aa8b","4d908e","577590","277da1"]
   let colorSet = ["f94144", "90be6d", "43aa8b", "4d908e", "577590", "277da1"]
   let cols = [] 
   
   let userInput = document.querySelector('#text-input textarea')
   let msgContent = userInput.value
   
   let fonts = []
   let font
   let fontsBytes = []
   let openTypeFonts = []
   let OpenTypeFont
   let fontTypes = document.querySelectorAll('#font-choose .options input')
   let selectedType

   /* REGULATORS */
   let containerWidth = document.querySelector('#font-size input')
   let currentFontSize

   let depthRegulator = document.querySelector('#depth input')
   let extrusionDepth = depthRegulator.value

   let tumbleSlider = document.querySelector('#tumble')
   let tumbleRegulator = document.querySelector('#tumble input')
   let tumbleStrength = tumbleRegulator.value
   let tumbleRotations = []

   let alignTabs = document.querySelectorAll('#text-align .radios .radio input')
   let alignOptions = ['left', 'center', 'right', 'justify']
   let selectedAlign = alignOptions[1]

   let animationTabs = document.querySelectorAll('#ZoomWaveTumblePunch .radios .radio input')
   let animationOptions = ['Zoom', 'Wave', 'Tumble', 'Punch']
   let selectedAnimation

   let punchOffsets = []
   
   let angle = 0

   let FPCLetters = []
   let textCenter = { x: 0, y: 0 }
   let period = 180

   function preload() {
      const fontPaths = [
         'Materials/Montserrat-Regular.ttf',
         'Materials/Amarante/Amarante-Regular.ttf',
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
      xRot = random(-PI/8, PI/8)
      yRot = random(-PI/6, PI/6)
      zRot = random(-PI/6, PI/6)

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

      for (let i = 0; i < animationTabs.length; i++) {
         animationTabs[i].addEventListener('change', function(event) {
            if(event.target.checked) {
               selectedAnimation = animationOptions[i]

               if(selectedAnimation === 'Zoom') {
                  depthRegulator.value = 200
                  extrusionDepth = depthRegulator.value
                  tumbleSlider.classList.add('hidden')

               } else if(selectedAnimation === 'Wave') {
                  depthRegulator.value = 20
                  extrusionDepth = depthRegulator.value
                  tumbleSlider.classList.add('hidden')

               } else if(selectedAnimation === 'Tumble') {
                  depthRegulator.value = 20
                  extrusionDepth = depthRegulator.value
                  tumbleSlider.classList.remove('hidden')

               } else if(selectedAnimation === 'Punch') {
                  tumbleSlider.classList.add('hidden')
                  depthRegulator.value = 20
                  extrusionDepth = depthRegulator.value
               }
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
            FPCLetters = updateTextLayout()
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
            FPCLetters = updateTextLayout()
         }
      }
      
      userInput.addEventListener('input', function() {
         updateFontSize()
         Tumble()
         Punch()
         angle = 0
      })
      window.addEventListener('resize', updateFontSize)
      containerWidth.addEventListener('input', updateContainerWidth)
      depthRegulator.addEventListener('input', function(event) {extrusionDepth = event.target.value})
      tumbleRegulator.addEventListener('input', function(event) {tumbleStrength = event.target.value})

      function updateTextLayout() {  
         let letters = []

         let align = selectedAlign

         let lines = userInput.value.split('\n')
         let lineHeight = currentFontSize 
         let font = OpenTypeFont

         let containerOffsetWidth = 0
         let containerOffsetHeight = lines.length * lineHeight
         let baselineShift = lineHeight/5

         let totalX = 0
         let totalY = 0
         let count = 0

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

                  let xs = shifted.map(c => c.x ?? 0)
                  let ys = shifted.map(c => c.y ?? 0)
                  let center = {
                     x: xs.reduce((a, b) => a + b, 0) / xs.length,
                     y: ys.reduce((a, b) => a + b, 0) / ys.length
                  }
                  letters.push({ commands: shifted, center })

                  charOffsetX += charWidth

                  totalX += center.x
                  totalY += center.y
                  count++
               }

               if(j < words.length - 1) {
                  charOffsetX += extraSpace + font.getAdvanceWidth(' ', currentFontSize)
               }
            }

            textCenter = {
               x: totalX / count,
               y: totalY / count
            }
         }
         return letters
      }
      FPCLetters = updateTextLayout() 

      generateColors()
      Tumble()
      Punch()
   }
   
   function quadLerp(a, b, c, t) {
      return (1 - t)**2 * a + 2 * (1 - t) * t * b + t**2 * c;
   }
   function generateColors() {
      let totalCommands = 0;
      for (let letter of FPCLetters) {
         totalCommands += letter.commands.length;
      }

      for (let i = 0; i < totalCommands; i++) {
         cols[i] = round(random(colorSet.length - 1))
      }
   }

   function Tumble() {
      tumbleRotations = []

      for (let i = 0; i < FPCLetters.length; i++) {
         tumbleRotations.push({
            rx: random(-PI/8, PI/8),
            ry: random(-PI/6, PI/6),
            rz: random(-PI/6, PI/6)
         })
      }
   }

   function Punch() {
      punchOffsets = []

      for (let i = 0; i < FPCLetters.length; i++) {
         let letter = FPCLetters[i]
         let dx = letter.center.x - textCenter.x
         let dy = letter.center.y - textCenter.y

         let angle = atan2(dy, dx)
         let dist = sqrt(dx * dx + dy * dy)
         let power = map(dist, 0, 300, 0, 5)

         let offsetX = cos(angle) * power
         let offsetY = sin(angle) * power

         let rotZ = map(power, 0.1, 6, 0, -PI/2) * 3 
         let rotY = map(power, 0.1, 6, 0, -PI/2) * (angle/5)
         let rotX = map(power, 0.1, 6, 0, -PI/2) * 3
         if(random(1) < 0.3) {
            rotY += random(PI, PI * 2)
         }

         punchOffsets.push({
            dx: offsetX,
            dy: offsetY,
            dz: 0,
            rx: rotX,
            ry: rotY,
            rz: rotZ
         })
      }
   }

   
   
   function easeInOutQuint (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
   }
   function easeOutCubic(t, b, c, d) {
      t /= d;
      t--;
      return c * (t * t * t + 1) + b;
   }

   function drawLetter(letter) {
      let res = 5
      let closePoint = 0;

      let t = angle % period     // t от 0 до 1
      let progress = (t / period) * 2
      if (progress > 1) progress = 2 - progress // Reversing phase
      let extru = easeInOutQuint(progress, 0, extrusionDepth, 1) 

      /* if (progress === 0) {
         generateColors()
      } 
 */
      let cmd = letter.commands
      for (let i = 0; i < letter.commands.length; i++) {
         
         fill(`#${colorSet[cols[i]]}`)
         noStroke()

         if (cmd[i].type == "M") {
         }

         if (cmd[i].type == "Z") {
         beginShape(TRIANGLE_STRIP);
            vertex(cmd[i - 1].x, cmd[i - 1].y, -extru);
            vertex(cmd[i - 1].x, cmd[i - 1].y, extru);

            vertex(cmd[closePoint].x, cmd[closePoint].y, -extru);
            vertex(cmd[closePoint].x, cmd[closePoint].y, extru);
         endShape();

         closePoint = i + 1;
         }

         if (cmd[i].type == "L") {
         beginShape(TRIANGLE_STRIP);
            vertex(cmd[i - 1].x, cmd[i - 1].y, -extru);
            vertex(cmd[i - 1].x, cmd[i - 1].y, extru);

            vertex(cmd[i].x, cmd[i].y, -extru);
            vertex(cmd[i].x, cmd[i].y, extru);
         endShape();
         }
         
         if (cmd[i].type == "Q") {
         beginShape(TRIANGLE_STRIP);
            for(let r = 0; r < res; r++){
               let thisT = r/(res - 1);
               let thisX = quadLerp(cmd[i - 1].x, cmd[i].x1, cmd[i].x, thisT);
               let thisY = quadLerp(cmd[i - 1].y, cmd[i].y1, cmd[i].y, thisT);

               vertex(thisX, thisY, -extru);
               vertex(thisX, thisY, extru);
            }
         endShape();
         }

         if (cmd[i].type == "C") {
         beginShape(TRIANGLE_STRIP);
            for(let r = 0; r < res; r++){
               let thisT = r/(res - 1);
               let thisX = bezierPoint(cmd[i - 1].x, cmd[i].x1, cmd[i].x2, cmd[i].x, thisT);
               let thisY = bezierPoint(cmd[i - 1].y, cmd[i].y1, cmd[i].y2, cmd[i].y, thisT);

               vertex(thisX, thisY, -extru);
               vertex(thisX, thisY, extru);
            }
         endShape();
         } 
      }

      for (let m = 0; m < 2; m++) {
         if(m === 0) {
            translate(0, 0, -extru)
         } else{
            translate(0, 0, extru*2)
         }

         for (let j = 0; j < 2; j++) {
            let openContour = false
            closePoint = 0
            
            noStroke();
            fill(255, 110, 10)

            for (i = 0; i < cmd.length; i++) {
               if (cmd[i].type == "M") {
                  if(i > 0){
                     beginContour();
                     openContour = true;
                  } else {
                     beginShape(TESS);
                  }
                  vertex(cmd[i].x, cmd[i].y);
               }
            
               if (cmd[i].type == "Z") {
                  if(openContour){
                     endContour();
                  }
                  if(i == cmd.length - 1){
                     endShape(CLOSE);
                  }
                  closePoint = i + 1;
               }
            
               if (cmd[i].type == "L") {
                  vertex(cmd[i].x, cmd[i].y);
               }
      
               if (cmd[i].type == "Q") {
                  quadraticVertex(cmd[i].x1, cmd[i].y1, cmd[i].x, cmd[i].y);
               }
      
               if (cmd[i].type == "C") {
                  bezierVertex(cmd[i].x1, cmd[i].y1, cmd[i].x2, cmd[i].y2, cmd[i].x, cmd[i].y);
                  vertex(cmd[i].x, cmd[i].y);
               }
            }
         }
      }
   }

   function draw() {
      background(255, 190, 100)     
      angle++

      let t = angle % period
      let pauseRatio = 0.2
      let activeDuration = period * (1 - pauseRatio)
      let progress = 0

      let tumblePhase
      let punchPhase

      if(t < activeDuration) {
         progress = (t /activeDuration) * 2

         if(progress > 1) progress = 2 - progress

         tumblePhase = easeInOutQuint(progress, 0, tumbleStrength, 1)
         punchPhase = easeOutCubic(progress, 0, tumbleStrength, 1)
      } else {
         tumblePhase = 0
         punchPhase = 0
      }
      
      if (progress === 0) {
         Tumble()
         Punch()
      }
      
      FPCLetters.forEach((letter, idx) => {
         push()
         translate(letter.center.x, letter.center.y, 0)
         if (selectedAnimation === 'Wave') {
            let rx = sin(angle + idx*10)*15
            let ry = sin(angle + idx*15)*15
            let rz = sin(angle + idx*5)*15
            rotateX(rx)
            rotateY(ry)
            rotateZ(rz)
         } else if (selectedAnimation === 'Tumble') {
            let rot = tumbleRotations[idx] || { rx: 0, ry: 0, rz: 0 }

            let rx = rot.rx * tumblePhase
            let ry = rot.ry * tumblePhase
            let rz = rot.rz * tumblePhase

            rotateX(rx)
            rotateY(ry)
            rotateZ(rz)
         } else if (selectedAnimation === 'Punch') {
            let p = punchOffsets[idx] || { dx: 0, dy: 0, dz: 0, rx: 0, ry: 0, rz: 0 }

            let shiftX = p.dx * punchPhase
            let shiftY = p.dy * punchPhase
            let shiftZ = p.dz * punchPhase

            let rotX = p.rx * punchPhase
            let rotY = p.ry * punchPhase
            let rotZ = p.rz * punchPhase

            translate(shiftX, shiftY)
            rotateX(rotX)
            rotateY(rotY)
            rotateZ(rotZ)
         }

         translate(-letter.center.x, -letter.center.y, 0)

         drawLetter(letter)
         pop()
      })

   }

   function windowResized() {
      let container = document.querySelector('#canvas')
      resizeCanvas(container.offsetWidth, container.offsetHeight)
   }