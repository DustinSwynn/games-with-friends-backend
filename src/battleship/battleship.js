// built following a tutorial at : https://youtu.be/U64vIhh0TyM



document.addEventListener('DOMContentLoaded', () => {
    const userGrid = document.querySelector('.grid-user')
    const opponentGrid = document.querySelector('.grid-opponent')
    const displayGrid = document.querySelector('.grid-display')
    const ships = document.querySelectorAll('.ship')
    const destroyer = document.querySelector('.destroyer-container')
    const submarine = document.querySelector('.submarine-container')
    const cruiser = document.querySelector('.cruiser-container')
    const battleship = document.querySelector('.battleship-container')
    const carrier = document.querySelector('.carrier-container')
    const startButton = document.querySelector('#start')
    const rotateButton = document.querySelector('#rotate')
    const restartButton = document.querySelector('#restart')
    const homeButton = document.querySelector('#home')
    const turnDisplay = document.querySelector('#whose-turn')
    const infoDisplay = document.querySelector('#info')
    const setupButtons = document.getElementById('setup-buttons')
    const userSquares = []
    const opponentSquares = []
    const yes = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99]
    let isHorizontal = true
    let currentPlayer = 'user'
    const width = 10
    let playerNum = 0
    let ready = false
    let enemyReady = false
    let allShipsPlaced = false
    let shotFired = -1

    let gameEnded = false
    let url = window.location.href;
    console.log(url);
    let userId = url.split("=")[1];
    console.log(userId);



    const shipArray = [
      {
        name: 'destroyer',
        directions: [
          [0, 1],
          [0, width]
        ]
      },
      {
        name: 'submarine',
        directions: [
          [0, 1, 2],
          [0, width, width*2]
        ]
      },
      {
        name: 'cruiser',
        directions: [
          [0, 1, 2],
          [0, width, width*2]
        ]
      },
      {
        name: 'battleship',
        directions: [
          [0, 1, 2, 3],
          [0, width, width*2, width*3]
        ]
      },
      {
        name: 'carrier',
        directions: [
          [0, 1, 2, 3, 4],
          [0, width, width*2, width*3, width*4]
        ]
      },
    ]
  
    createBoard(userGrid, userSquares)
    createBoard(opponentGrid, opponentSquares)
  
    
    startGame()
   
    function startGame() {
      const socket = io();
  
      // Get player number
      socket.on('player-number', num => {
        if (num === -1) {
          infoDisplay.innerHTML = "Sorry, the server is full.<br></br>Try refreshing this page.<br></br>When an active player disconnects, you will be in the game"
        } else {
          playerNum = parseInt(num)
          if(playerNum === 1) currentPlayer = "enemy"
  
          console.log(playerNum)
  
          // Get other player
          socket.emit('check-players')
        }
      })
  
      // Other player connection
      socket.on('player-connection', num => {
        console.log(`Player number ${num} has connected or disconnected`)
        playerConnectedOrDisconnected(num)
      })
  
      
      socket.on('enemy-ready', num => {
        enemyReady = true
        playerReady(num)
        if (ready) {
          playGame(socket)
          setupButtons.style.display = 'none'
        }
      })
  
      socket.on('check-players', players => {
        players.forEach((p, i) => {
          if(p.connected) playerConnectedOrDisconnected(i)
          if(p.ready) {
            playerReady(i)
            if(i !== playerReady) enemyReady = true
          }
        })
      })
  
      // On Timeout
      socket.on('timeout', () => {
        infoDisplay.innerHTML = '10 minute limit reached'
      })
  
      // Ready button
      startButton.addEventListener('click', () => {
        if(allShipsPlaced) playGame(socket)
        else infoDisplay.innerHTML = "Please place all ships"
      })
  
      // Event listeners for firing
      opponentSquares.forEach(square => {
        square.addEventListener('click', () => {
          if(currentPlayer === 'user' && ready && enemyReady) {
            shotFired = square.dataset.id
            socket.emit('fire', shotFired)
          }
        })
      })
  
      // On Fire Received
      socket.on('fire', id => {
        enemyGo(id)
        const square = userSquares[id]
        socket.emit('fire-reply', square.classList)
        playGame(socket)
      })
  
      // On Fire Reply Received
      socket.on('fire-reply', classList => {
        revealSquare(classList)
        playGame(socket)
      })
  
      function playerConnectedOrDisconnected(num) {
        let player = `.p${parseInt(num) + 1}`
        document.querySelector(`${player} .connected`).classList.toggle('active')
        if(parseInt(num) === playerNum) document.querySelector(player).style.fontWeight = 'bold'
      }
    }
  
    //Create Board
    function createBoard(grid, squares) {
      for (let i = 0; i < width*width; i++) {
        const square = document.createElement('div')
        square.dataset.id = i
        grid.appendChild(square)
        squares.push(square)
      }
    }
  
    //Rotate the ships
    function rotate() {
      if (isHorizontal) {
        destroyer.classList.toggle('destroyer-container-vertical')
        submarine.classList.toggle('submarine-container-vertical')
        cruiser.classList.toggle('cruiser-container-vertical')
        battleship.classList.toggle('battleship-container-vertical')
        carrier.classList.toggle('carrier-container-vertical')
        isHorizontal = false
        return
      }
      if (!isHorizontal) {
        destroyer.classList.toggle('destroyer-container-vertical')
        submarine.classList.toggle('submarine-container-vertical')
        cruiser.classList.toggle('cruiser-container-vertical')
        battleship.classList.toggle('battleship-container-vertical')
        carrier.classList.toggle('carrier-container-vertical')
        isHorizontal = true
        return
      }
    }
    rotateButton.addEventListener('click', rotate)
  
    // restart game
    function restart() {
      location.reload();
    }
    restartButton.addEventListener('click', restart)

    function home() {
      // window.location.replace("http://localhost:3000");
      window.location.href = "https://games-with-friends-final-fe-dot-second-folio-294223.nn.r.appspot.com/";
    }
    homeButton.addEventListener('click', home)
  
    // move user ship
    ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
    userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
    userSquares.forEach(square => square.addEventListener('dragover', dragOver))
    userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
    //userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
    userSquares.forEach(square => square.addEventListener('drop', dragDrop))
    //userSquares.forEach(square => square.addEventListener('dragend', dragEnd))
  
    let selectedShipNameWithIndex
    let draggedShip
    let draggedShipLength
  
    ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
      selectedShipNameWithIndex = e.target.id
    }))
  
    function dragStart() {
      draggedShip = this
      draggedShipLength = this.childNodes.length
    }
  
    function dragOver(e) {
      e.preventDefault()
    }
  
    function dragEnter(e) {
      e.preventDefault()
    }
  
  
    let takenIds = []; // to keep track of which div has been occupied so we cant place ships on top of each other
  
    function dragDrop() {
      let shipNameWithLastId = draggedShip.lastChild.id
      let shipClass = shipNameWithLastId.slice(0, -2)
      let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
      let shipLastId = lastShipIndex + parseInt(this.dataset.id)
      const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92,3,13,23,33,43,53,63,73,83,93]
      const notAllowedVertical = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60]
      
      let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex)
      let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex)
      selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))
  
      //console.log(lastShipIndex)
      //console.log(shipLastId)
      shipLastId = shipLastId - selectedShipIndex
      shipLastIdVertical = (shipLastId - lastShipIndex)+width*lastShipIndex
      //console.log(shipLastIdVertical)
      if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
        for (let j = 0; j < draggedShipLength; j++) {
          if (takenIds.includes(parseInt(this.dataset.id) - selectedShipIndex + j)) {
            return
          }
        }
        if (selectedShipIndex !== 0) {
          return
        }
        for (let i = 0; i < draggedShipLength; i++) {
          let directionClass
          if (i === 0) {
            directionClass = 'start'
          }
          else if (i === draggedShipLength - 1) {
            directionClass = 'end'
          }
          else {
            directionClass = 'body'
          }
          userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass)
          takenIds.push(parseInt(this.dataset.id) - selectedShipIndex + i)
        }
      } else if (!isHorizontal /*&& !newNotAllowedVertical.includes(shipLastId)*/) {
        for (let j = 0; j < draggedShipLength; j++) {
          if (takenIds.includes(parseInt(this.dataset.id) - selectedShipIndex + width*j)) {
            return
          }
        }
        if (selectedShipIndex !== 0) {
          return
        }
        
        if (!yes.includes(shipLastIdVertical)) {
          return
        }
  
        for (let i = 0; i < draggedShipLength; i++) {
          let directionClass
          if (i === 0) {
            directionClass = 'start'
          }
          else if (i === draggedShipLength - 1) {
            directionClass = 'end'
          }
          else {
            directionClass = 'body'
          }
          userSquares[parseInt(this.dataset.id) - selectedShipIndex + width*i].classList.add('taken', 'vertical', directionClass, shipClass)
          // console.log(newNotAllowedHorizontal)
          // console.log(newNotAllowedVertical)
          //console.log(parseInt(this.dataset.id) - selectedShipIndex + width*i)
          takenIds.push(parseInt(this.dataset.id) - selectedShipIndex + width*i)
          // console.log(takenIds)
          // console.log(userSquares)
        }
      } else {
        //console.log(shipLastId)
        return
      }
  
      displayGrid.removeChild(draggedShip)
      if(!displayGrid.querySelector('.ship')) {
        allShipsPlaced = true
      }
    }
  
    
    // Game Logic
    function playGame(socket) {
      setupButtons.style.display = 'none'
      if(gameEnded) return
      if(!ready) {
        socket.emit('player-ready')
        ready = true
        playerReady(playerNum)
      }
  
      if(enemyReady) {
        if(currentPlayer === 'user') {
          turnDisplay.innerHTML = 'Your Turn'
        }
        if(currentPlayer === 'enemy') {
          turnDisplay.innerHTML = "Enemy's Turn"
        }
      }
    }
  
    function playerReady(num) {
      let player = `.p${parseInt(num) + 1}`
      document.querySelector(`${player} .ready`).classList.toggle('active')
    }
  
    let destroyerCount = 0
    let submarineCount = 0
    let cruiserCount = 0
    let battleshipCount = 0
    let carrierCount = 0
  
    function revealSquare(classList) {
      const enemySquare = opponentGrid.querySelector(`div[data-id='${shotFired}']`)
      const obj = Object.values(classList)
      if (!enemySquare.classList.contains('hit') && currentPlayer === 'user' && !gameEnded) {
        if (obj.includes('destroyer')) destroyerCount++
        if (obj.includes('submarine')) submarineCount++
        if (obj.includes('cruiser')) cruiserCount++
        if (obj.includes('battleship')) battleshipCount++
        if (obj.includes('carrier')) carrierCount++
      }
      if (obj.includes('taken')) {
        enemySquare.classList.add('hit')
      } else {
        enemySquare.classList.add('miss')
      }
      checkForWins()
      currentPlayer = 'enemy'
    }
  
    let opponentDestroyerCount = 0
    let opponentSubmarineCount = 0
    let opponentCruiserCount = 0
    let opponentBattleshipCount = 0
    let opponentCarrierCount = 0
  
  
    function enemyGo(square) {
      if (!userSquares[square].classList.contains('hit')) {
        const hit = userSquares[square].classList.contains('taken')
        userSquares[square].classList.add(hit ? 'hit' : 'miss')
        if (userSquares[square].classList.contains('destroyer')) {
          opponentDestroyerCount++
        }
        if (userSquares[square].classList.contains('submarine')) {
          opponentSubmarineCount++
        }
        if (userSquares[square].classList.contains('cruiser')) {
          opponentCruiserCount++
        }
        if (userSquares[square].classList.contains('battleship')) {
          opponentBattleshipCount++
        }
        if (userSquares[square].classList.contains('carrier')) {
          opponentCarrierCount++
        }
          checkForWins()
      } 
      currentPlayer = 'user'
      turnDisplay.innerHTML = 'Your Turn'
    }
  
    function checkForWins() {
      let enemy = 'enemy'
      if (destroyerCount === 2) {
        infoDisplay.innerHTML = `You sunk the ${enemy}'s destroyer`
        destroyerCount = 10
      }
      if (submarineCount === 3) {
        infoDisplay.innerHTML = `You sunk the ${enemy}'s submarine`
        submarineCount = 10
      }
      if (cruiserCount === 3) {
        infoDisplay.innerHTML = `You sunk the ${enemy}'s cruiser`
        cruiserCount = 10
      }
      if (battleshipCount === 4) {
        infoDisplay.innerHTML = `You sunk the ${enemy}'s battleship`
        battleshipCount = 10
      }
      if (carrierCount === 5) {
        infoDisplay.innerHTML = `You sunk the ${enemy}'s carrier`
        carrierCount = 10
      }
      if (opponentDestroyerCount === 2) {
        infoDisplay.innerHTML = `${enemy} sunk your destroyer`
        opponentDestroyerCount = 10
      }
      if (opponentSubmarineCount === 3) {
        infoDisplay.innerHTML = `${enemy} sunk your submarine`
        opponentSubmarineCount = 10
      }
      if (opponentCruiserCount === 3) {
        infoDisplay.innerHTML = `${enemy} sunk your cruiser`
        opponentCruiserCount = 10
      }
      if (opponentBattleshipCount === 4) {
        infoDisplay.innerHTML = `${enemy} sunk your battleship`
        opponentBattleshipCount = 10
      }
      if (opponentCarrierCount === 5) {
        infoDisplay.innerHTML = `${enemy} sunk your carrier`
        opponentCarrierCount = 10
      }
  
      if ((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) === 50) {
        if (!gameEnded) {
          infoDisplay.innerHTML = "You Won!"

        var xhttp = new XMLHttpRequest();

        xhttp.open('GET', "/battleship/addWin?userid=" + userId, true);
        xhttp.send();
        gameEnded = true;
        }
      }

      if ((opponentDestroyerCount + opponentSubmarineCount + opponentCruiserCount + opponentBattleshipCount + opponentCarrierCount) === 50) {
        if (!gameEnded) {
            infoDisplay.innerHTML = `${enemy.toUpperCase()} Won !`

            var xhttp = new XMLHttpRequest();

            xhttp.open('GET', "/battleship/addLoss?userid=" + userId, true);
            xhttp.send();

            gameEnded = true;
        } 
      }
    }

  })
  