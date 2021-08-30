// отвечает в целом за все приложение 
class Application {
	mouse = null;

	player = null;
	opponent = null;

	scenes = {};
	activeScene = null;

	constructor(scenes = {}) {
		const mouse = new Mouse(document.body);

		const player = new BattlefieldView(true);
		const opponent = new BattlefieldView(false);

		Object.assign(this, { mouse, player, opponent });

		//поиск div и добавление dom
		document.querySelector('[data-side="player"]').append(player.root);
		document.querySelector('[data-side="opponent"]').append(opponent.root);
		
		//проходимся по всем сценам
		for (const [sceneName, SceneClass] of Object.entries(scenes)) { //позвоялет работать как с массивом
			//генерируем сцены, передаем имя и указываем на них
			this.scenes[sceneName] = new SceneClass(sceneName, this);
		}
		//пробегаемся по всем уже созданным сценам
		for (const scene of Object.values(this.scenes)) {
			scene.init();
		}

		requestAnimationFrame(() => this.tick());
	}

	tick() {
		requestAnimationFrame(() => this.tick());

		if (this.activeScene) {
			this.activeScene.update();
		}

		this.mouse.tick();
	}
	//начать сцену
	start(sceneName, ...args) {
		//проверка есть ли активная сцена 
		if (this.activeScene && this.activeScene.name === sceneName) {
			return false;
		}
		//проверка на отсутсвие сцены 
		if (!this.scenes.hasOwnProperty(sceneName)) {
			return false;
		}
		//если нужна новая, то останавливаем старую
		if (this.activeScene) {
			this.activeScene.stop();
		}
		//поиск нужной сены и ее запуск
		const scene = this.scenes[sceneName];
		this.activeScene = scene;
		scene.start(...args);

		return true;
	}
}
