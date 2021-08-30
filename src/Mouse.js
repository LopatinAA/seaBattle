//перемещение мыши 
class Mouse {
	element = null;

	//текущее и предыдущее состояние мыши 

	under = false;
	pUnder = false;

	x = null;
	y = null;

	pX = null;
	pY = null;

	left = false;
	pLeft = false;

	delta = 0;
	pDelta = 0;

	constructor(element) {
		this.element = element;

		const update = (e) => {
			this.x = e.clientX;		//обновление коордиат
			this.y = e.clientY;
			this.delta = 0;			//не приводят к прокрутке, поэтому 0
			this.under = true;		//мышь над элементом
		};
		//движение мыши над элементом 
		element.addEventListener("mousemove", (e) => {
			this.tick();
			update(e);
		});
		//граниа и входит в элемент 
		element.addEventListener("mouseenter", (e) => {
			this.tick();
			update(e);
		});
		//граница и выходит из элемента
		element.addEventListener("mouseleave", (e) => {
			this.tick();
			update(e);

			this.under = false; 	//мышь больше не над элементом
		});
		//нажатие лкм
		element.addEventListener("mousedown", (e) => {
			this.tick();
			update(e);

			if (e.button === 0) {	//0 соотвествует лкм
				this.left = true;
			}
		});
		//отжатие лкм
		element.addEventListener("mouseup", (e) => {
			this.tick();
			update(e);

			if (e.button === 0) {
				this.left = false;
			}
		});
		//событие колесика 
		element.addEventListener("wheel", (e) => {
			this.tick();

			this.x = e.clientX;
			this.y = e.clientY;
			this.delta = e.deltaY > 0 ? 1 : -1;
			this.under = true;
		});
	}
	//переписывание текущего в пред состояние
	tick() {
		this.pX = this.x;
		this.pY = this.y;
		this.pUnder = this.under;
		this.pLeft = this.left;
		this.pDelta = this.delta;
		this.delta = 0;
	}
}
