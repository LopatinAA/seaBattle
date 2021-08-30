//логическое поле
class Battlefield {
	ships = [];
	shots = [];

	#matrix = null;	//приватное свойство
	#changed = true;// флаг какого либо изменения 

	get loser() { //проверка на поражение
		for (const ship of this.ships) {
			if (!ship.killed) {
				return false;
			}
		}

		return true;
	}

	get matrix() {
		if (!this.#changed) { //если нет измениний возвращаем текущее 
			this.#matrix;
		}

		const matrix = [];
		//создание матриы 
		for (let y = 0; y < 10; y++) {
			const row = [];

			for (let x = 0; x < 10; x++) {
				const item = {
					x,
					y,
					ship: null,
					free: true,

					shoted: false,
					wounded: false,
				};

				row.push(item);
			}

			matrix.push(row);
		}
		//пробегаемся по всем кораблям
		for (const ship of this.ships) {
			if (!ship.placed) {
				continue;
			}
			//ориентация корабля 
			const { x, y } = ship;
			const dx = ship.direction === "row";
			const dy = ship.direction === "column";
			//помещение коробля на поле 
			for (let i = 0; i < ship.size; i++) {
				const cx = x + dx * i;
				const cy = y + dy * i;

				const item = matrix[cy][cx];
				item.ship = ship;
			}
			//обход ячеек вокруг корабля 
			for (let y = ship.y - 1; y < ship.y + ship.size * dy + dx + 1; y++) {
				for (let x = ship.x - 1; x < ship.x + ship.size * dx + dy + 1; x++) {
					if (this.inField(x, y)) {
						const item = matrix[y][x];
						item.free = false;
					}
				}
			}
		}

		for (const { x, y } of this.shots) {
			const item = matrix[y][x];
			item.shoted = true;

			if (item.ship) {
				item.wounded = true;
			}
		}

		this.#matrix = matrix;
		this.#changed = false;

		return this.#matrix;
	}

	get complete() { //проверка состояния готовности игрового поля
		if (this.ships.length !== 10) {
			return false;
		}

		for (const ship of this.ships) {
			if (!ship.placed) {
				return false;
			}
		}

		return true;
	}
	//проверка координат на попадание в поле
	inField(x, y) {
		const isNumber = (n) =>
			parseInt(n) === n && !isNaN(n) && ![Infinity, -Infinity].includes(n);

		if (!isNumber(x) || !isNumber(y)) {
			return false;
		}

		return 0 <= x && x < 10 && 0 <= y && y < 10;
	}
	// добавить корабль 
	addShip(ship, x, y) {
		if (this.ships.includes(ship)) { 	//проверка на наличие коробля
			return false;
		}

		this.ships.push(ship);

		if (this.inField(x, y)) {
			const dx = ship.direction === "row";
			const dy = ship.direction === "column";

			let placed = true;

			for (let i = 0; i < ship.size; i++) {
				const cx = x + dx * i;
				const cy = y + dy * i;

				if (!this.inField(cx, cy)) {
					placed = false;
					break;
				}

				const item = this.matrix[cy][cx];
				if (!item.free) {
					placed = false;
					break;
				}
			}

			if (placed) {
				Object.assign(ship, { x, y });
			}
		}

		this.#changed = true;
		return true;
	}
	//убрать корабль 
	removeShip(ship) {
		if (!this.ships.includes(ship)) {
			return false;
		}
		//если корабль есть, то удаление
		const index = this.ships.indexOf(ship);
		this.ships.splice(index, 1);

		ship.x = null;
		ship.y = null;

		this.#changed = true;
		return true;
	}
	//убрать все корабли
	removeAllShips() {
		const ships = this.ships.slice();	//копия всех массивов кораблей

		for (const ship of ships) {
			this.removeShip(ship);	//удаление конкретного корабля
		}

		return ships.length; 	//возвращаем кол-во удаленных кораблей
	}

	addShot(shot) {
		//если выстрел уже был, то мы его не добавляем 
		for (const { x, y } of this.shots) {
			if (x === shot.x && y === shot.y) {
				return false;
			}
		}

		this.shots.push(shot);
		this.#changed = true;

		const matrix = this.matrix;
		const { x, y } = shot;
		//если есть корабль, 
		if (matrix[y][x].ship) {
			shot.setVariant("wounded");
			
			const { ship } = matrix[y][x];
			const dx = ship.direction === "row";
			const dy = ship.direction === "column";

			let killed = true;

			for (let i = 0; i < ship.size; i++) {
				const cx = ship.x + dx * i;
				const cy = ship.y + dy * i;
				const item = matrix[cy][cx];
				//если есть палуба которая не ранена - корабль не убит
				if (!item.wounded) {
					killed = false;
					break;
				}
			}

			if (killed) {
				ship.killed = true;

				for (let i = 0; i < ship.size; i++) {
					const cx = ship.x + dx * i;
					const cy = ship.y + dy * i;

					const shot = this.shots.find(
						(shot) => shot.x === cx && shot.y === cy
					);
					shot.setVariant("killed");
				}
			}
		}

		this.#changed = true;
		return true;
	}

	removeShot(shot) {
		if (!this.shots.includes(shot)) {
			return false;
		}

		const index = this.shots.indexOf(shot);
		this.shots.splice(index, 1);

		this.#changed = true;
		return true;
	}

	removeAllShots() {
		const shots = this.shots.slice();

		for (const shot of shots) {
			this.removeShot(shot);
		}

		return shots.length;
	}
	//размещение кораблей 
	randomize(ShipClass = Ship) {
		this.removeAllShips();

		for (let size = 4; size >= 1; size--) {
			for (let n = 0; n < 5 - size; n++) {
				//создание корабля
				const direction = getRandomFrom("row", "column");
				const ship = new ShipClass(size, direction);
				//пока не размещен, пытаемся его разместить
				while (!ship.placed) {
					const x = getRandomBetween(0, 9);
					const y = getRandomBetween(0, 9);

					this.removeShip(ship);
					this.addShip(ship, x, y);
				}
			}
		}
	}

	clear() {
		this.removeAllShots();
		this.removeAllShips();
	}
}
