window.onload = function () {
  // Генерация карты размером 40x25
  const MAP_WIDTH = 40;
  const MAP_HEIGHT = 25;
  const TILE_SIZE = 25.6; // Размер клетки в пикселях
  const map = [];
  const items = {
    sword: 2,
    healthPotion: 10,
  };
  const enemiesCount = 10;
  const hero = { x: 0, y: 0, health: 100, attack: 30 }; // Герой с начальным здоровьем 100
  const enemies = []; // Массив для хранения противников

  // Создаем пустую карту
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      map[y][x] = 'tileW'; // Заполняем всю карту стенами
    }
  }

  // Функция для создания прямоугольных комнат
  function createRoom(x, y, width, height) {
    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        map[i][j] = 'tile'; // Заполняем прямоугольную комнату полом
      }
    }
  }

  // Генерируем случайное количество (5 - 10) комнат
  const minRooms = 5;
  const maxRooms = 10;
  const numRooms = Math.floor(Math.random() * (maxRooms - minRooms + 1)) + minRooms;

  for (let i = 0; i < numRooms; i++) {
    const roomWidth = Math.floor(Math.random() * 6) + 3; // Случайная ширина комнаты от 3 до 8
    const roomHeight = Math.floor(Math.random() * 6) + 3; // Случайная высота комнаты от 3 до 8
    const x = Math.floor(Math.random() * (MAP_WIDTH - roomWidth - 1)) + 1; // Случайная координата X для комнаты
    const y = Math.floor(Math.random() * (MAP_HEIGHT - roomHeight - 1)) + 1; // Случайная координата Y для комнаты
    createRoom(x, y, roomWidth, roomHeight);
  }

  // Функция для создания проходов
  function createCorridors() {
    // Генерируем случайное количество (3 - 5) вертикальных и горизонтальных проходов
    const minCorridors = 3;
    const maxCorridors = 5;
    const numVerticalCorridors =
      Math.floor(Math.random() * (maxCorridors - minCorridors + 1)) + minCorridors;
    const numHorizontalCorridors =
      Math.floor(Math.random() * (maxCorridors - minCorridors + 1)) + minCorridors;

    // Создаем вертикальные проходы
    for (let i = 0; i < numVerticalCorridors; i++) {
      const corridorX = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1; // Случайная координата X для прохода
      for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        map[y][corridorX] = 'tile'; // Заполняем вертикальный проход полом
      }
    }

    // Создаем горизонтальные проходы
    for (let i = 0; i < numHorizontalCorridors; i++) {
      const corridorY = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1; // Случайная координата Y для прохода
      for (let x = 1; x < MAP_WIDTH - 1; x++) {
        map[corridorY][x] = 'tile'; // Заполняем горизонтальный проход полом
      }
    }
  }

  createCorridors();

  // Размещаем мечи
  for (let i = 0; i < items.sword; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * MAP_WIDTH);
      y = Math.floor(Math.random() * MAP_HEIGHT);
    } while (map[y][x] !== 'tile');
    map[y][x] = 'tileSW';
  }

  // Размещаем зелья здоровья
  for (let i = 0; i < items.healthPotion; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * MAP_WIDTH);
      y = Math.floor(Math.random() * MAP_HEIGHT);
    } while (map[y][x] !== 'tile');
    map[y][x] = 'tileHP';
  }

  // Создаем массив пустых плиток
  const emptyTiles = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (map[y][x] === 'tile') {
        emptyTiles.push({ x: x, y: y });
      }
    }
  }

  // Выбираем случайную пустую плитку из массива и размещаем на ней врага
  for (let i = 0; i < enemiesCount; i++) {
    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
    const randomTile = emptyTiles[randomIndex];
    const { x, y } = randomTile;
    enemies.push({ x: x, y: y, health: 100, attack: 5 });
    map[y][x] = 'tileE';

    // Удаляем выбранную плитку из массива пустых плиток, чтобы избежать повторного выбора
    emptyTiles.splice(randomIndex, 1);
  }

  // Размещаем героя
  do {
    hero.x = Math.floor(Math.random() * MAP_WIDTH);
    hero.y = Math.floor(Math.random() * MAP_HEIGHT);
  } while (map[hero.y][hero.x] !== 'tile');

  map[hero.y][hero.x] = 'tileP';

  // Функция для обновления карты на основе массива map
  function updateMap() {
    const field = $('.field');
    field.empty();

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        // Создаем новый элемент плитки и присваиваем ему классы в соответствии с картой
        const tile = $('<div>').addClass('tile').addClass(map[y][x]);
        // Устанавливаем позицию и размеры плитки
        tile.css({
          left: x * TILE_SIZE + 'px',
          top: y * TILE_SIZE + 'px',
          width: TILE_SIZE + 'px',
          height: TILE_SIZE + 'px',
        });

        // Добавляем полоску здоровья герою, если он находится на клетке 'tileP' и у него есть здоровье
        if (map[y][x] === 'tileP' && hero.health) {
          tile.append(createHealthBar(hero.health));
        }

        // Добавляем полоску здоровья противнику, если он находится на клетке 'tileE' и у него есть здоровье
        if (map[y][x] === 'tileE' && enemies.length > 0) {
          const enemy = enemies.find((enemy) => enemy.x === x && enemy.y === y);
          if (enemy && enemy.health) {
            tile.append(createHealthBar(enemy.health));
          }
        }

        // Атака противников на героя
        if (map[y][x] === 'tileE' && hero.health && isPlayerAdjacent(x, y)) {
          hero.health -= 5; // Уменьшаем здоровье героя на 5
          // console.warn(`HP: ${hero.health} HP`);
          if (hero.health === 0) {
            location.reload();
          }
        }
        $('.hp').html(`ХП: ${hero.health} %`);
        $('.attack').html(`Урон: ${hero.attack}`);
        // Добавляем плитку на поле
        field.append(tile);
      }
    }
  }

  // Функция для создания полоски здоровья
  function createHealthBar(health) {
    return $('<div>')
      .addClass('health')
      .css({
        width: health + '%',
      });
  }

  // Функция для проверки наличия игрока в соседней клетке
  function isPlayerAdjacent(x, y) {
    // Проверяем все соседние клетки на наличие игрока
    return (
      (x > 0 && map[y][x - 1] === 'tileP') || // Слева
      (x < MAP_WIDTH - 1 && map[y][x + 1] === 'tileP') || // Справа
      (y > 0 && map[y - 1][x] === 'tileP') || // Сверху
      (y < MAP_HEIGHT - 1 && map[y + 1][x] === 'tileP') // Снизу
    );
  }

  // Обработчик событий клавиш для передвижения героя
  $(document).keydown(function (e) {
    const key = e.which;
    let newX = hero.x;
    let newY = hero.y;

    const moveMap = {
      87: { x: 0, y: -1 }, // W
      65: { x: -1, y: 0 }, // A
      83: { x: 0, y: 1 }, // S
      68: { x: 1, y: 0 }, // D
    };

    if (moveMap.hasOwnProperty(key)) {
      const move = moveMap[key];
      newX += move.x;
      newY += move.y;
    } else if (key === 32) {
      // Space
      attackEnemies();
      updateMap();
      return;
    } else {
      return;
    }

    // Проверяем, если герой находится на клетке с мечом, то увеличиваем его урон
    if (map[newY][newX] === 'tileSW') {
      hero.attack += 35;
      map[newY][newX] = 'tile'; // Убираем меч с карты
    }

    if (canMoveTo(newX, newY) && !isEnemyAt(newX, newY)) {
      if (map[newY][newX] === 'tileHP') {
        // Проверяем, есть ли на клетке зелье здоровья
        const healthToAdd = Math.min(100 - hero.health, 50); // Определяем количество здоровья, которое можно добавить
        hero.health = Math.min(hero.health + healthToAdd, 100); // Увеличиваем здоровье героя, не превышая максимальное значение

        if (hero.health === 100) {
          map[newY][newX] = 'tile'; // Убираем зелье здоровья с карты только если здоровье героя достигло 100
        }
      }
      moveHeroTo(newX, newY);
      updateMap();
    }
  });

  // Функция проверки, находится ли противник на заданных координатах
  function isEnemyAt(x, y) {
    return map[y][x] === 'tileE';
  }

  //Стенки
  function canMoveTo(x, y) {
    const tile = map[y][x];
    return (
      x >= 0 &&
      x < MAP_WIDTH &&
      y >= 0 &&
      y < MAP_HEIGHT &&
      (tile !== 'tileW' || tile === 'tileSW' || tile === 'tileHP')
    );
  }

  //Перемещение героя
  function moveHeroTo(x, y) {
    map[hero.y][hero.x] = 'tile';
    hero.x = x;
    hero.y = y;
    map[y][x] = 'tileP';
  }

  //Атака героем противников
  function attackEnemies() {
    for (const enemy of enemies) {
      if (isEnemyAdjacent(enemy)) {
        enemy.health -= hero.attack; // Отнимаем урон героя от здоровья противника
        if (enemy.health <= 0) {
          // Если здоровье противника меньше или равно 0, убираем его из массива и с карты
          const index = enemies.indexOf(enemy);
          enemies.splice(index, 1);
          map[enemy.y][enemy.x] = 'tile';
        }
        break; // Прерываем цикл, так как противник может атаковать только один раз за ход
      }
    }
  }

  // Проверяем, находится ли противник рядом с героем
  function isEnemyAdjacent(enemy) {
    return Math.abs(hero.x - enemy.x) + Math.abs(hero.y - enemy.y) === 1;
  }

  // Функция для обновления позиций противников
  function moveEnemies() {
    for (const enemy of enemies) {
      // Проверяем, находится ли противник рядом с героем
      if (isEnemyAdjacentToHero(enemy.x, enemy.y)) {
        continue; // Противник находится рядом с героем, пропускаем его ход
      }

      let newX, newY;

      do {
        // Клонируем координаты противника для проверки возможности движения
        newX = enemy.x;
        newY = enemy.y;

        // Выбираем случайное направление движения
        const direction = Math.floor(Math.random() * 4);

        // Обновляем координаты противника в соответствии с выбранным направлением
        switch (direction) {
          case 0: // Вверх
            newY -= 1;
            break;
          case 1: // Вниз
            newY += 1;
            break;
          case 2: // Влево
            newX -= 1;
            break;
          case 3: // Вправо
            newX += 1;
            break;
        }
      } while (!canMoveTo(newX, newY) || isSwordOrHealthPotion(newX, newY));

      // Перемещаем противника
      map[enemy.y][enemy.x] = 'tile'; // Освобождаем текущую позицию противника
      enemy.x = newX;
      enemy.y = newY;
      map[newY][newX] = 'tileE'; // Помещаем противника в новую позицию
    }
  }

  // Функция проверки, является ли клетка (x, y) местом с мечом или банкой здоровья
  function isSwordOrHealthPotion(x, y) {
    return map[y][x] === 'tileSW' || map[y][x] === 'tileHP';
  }

  // Функция для проверки, находится ли противник рядом с героем
  function isEnemyAdjacentToHero(enemyX, enemyY) {
    // Проверяем все соседние клетки на наличие героя
    return (
      (Math.abs(hero.x - enemyX) === 1 && hero.y === enemyY) || // Слева или справа от героя
      (Math.abs(hero.y - enemyY) === 1 && hero.x === enemyX) // Сверху или снизу от героя
    );
  }

  // Обработчик для случайного передвижения противников
  setInterval(function () {
    moveEnemies();
    updateMap();
  }, 700); // Обновление каждую секунду
};
