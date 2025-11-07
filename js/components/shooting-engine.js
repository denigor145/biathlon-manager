class ShootingEngine {
    constructor() {
        this.isActive = false;
        this.currentRound = null;
        this.participants = [];
        this.results = new Map();
        this.windConditions = [];
        
        console.log("ShootingEngine инициализирован");
    }
    
    // Инициализация стрельбы
    initializeShooting(round, participants, windConditions = []) {
        this.currentRound = round;
        this.participants = participants;
        this.windConditions = windConditions;
        this.isActive = true;
        this.results.clear();
        
        // Инициализируем результаты для всех участников
        participants.forEach(participant => {
            this.results.set(participant, {
                hits: 0,
                misses: 0,
                shots: [null, null, null, null, null],
                finished: false,
                totalTime: 0,
                shootingTime: 0
            });
        });
        
        console.log(`Стрельба инициализирована: ${round.name}, участников: ${participants.length}`);
    }
    
    // Рассчитать модификатор точности от ветра
    calculateWindModifier() {
        if (this.windConditions.length === 0) return 1.0;
        
        const wind = this.windConditions[Math.floor(Math.random() * this.windConditions.length)];
        
        switch(wind) {
            case "Сильный ветер":
                return 0.8; // -20% к точности
            case "Умеренный ветер":
                return 0.9; // -10% к точности
            case "Слабый ветер":
                return 0.95; // -5% к точности
            default:
                return 1.0;
        }
    }
    
    // Рассчитать время стрельбы для участника
    calculateShootingTime(participant) {
        const baseTime = 15000; // 15 секунд базовое время для 5 выстрелов
        const speedModifier = participant.shootingSpeed || 2.0;
        
        // Случайный разброс ±20%
        const randomVariation = 1 + (Math.random() - 0.5) * 0.4;
        
        return (baseTime / speedModifier) * randomVariation;
    }
    
    // Симуляция выстрела
    simulateShot(participant, shotIndex) {
        const round = this.currentRound;
        const baseAccuracy = participant.shooting[round.position] || 0.7;
        const consistency = participant.consistency || 0.8;
        const windModifier = this.calculateWindModifier();
        
        // Эффективная точность с учетом всех модификаторов
        const effectiveAccuracy = baseAccuracy * consistency * windModifier;
        
        // Шанс попадания
        const isHit = Math.random() < effectiveAccuracy;
        
        // Обновляем результаты
        const results = this.results.get(participant);
        results.shots[shotIndex] = isHit;
        
        if (isHit) {
            results.hits++;
        } else {
            results.misses++;
        }
        
        console.log(`${participant.name}: выстрел ${shotIndex + 1} - ${isHit ? 'ПОПАДАНИЕ' : 'ПРОМАХ'} (точность: ${Math.round(effectiveAccuracy * 100)}%)`);
        
        return isHit;
    }
    
    // Запуск стрельбы для всех участников
    startShooting() {
        if (!this.isActive) {
            console.error("Стрельба не инициализирована");
            return;
        }
        
        console.log("Запуск стрельбы для всех участников...");
        
        this.participants.forEach(participant => {
            this.startParticipantShooting(participant);
        });
    }
    
    // Запуск стрельбы для конкретного участника
    startParticipantShooting(participant) {
        const shootingTime = this.calculateShootingTime(participant);
        const shotInterval = shootingTime / 5; // Время между выстрелами
        
        console.log(`${participant.name}: время стрельбы ${(shootingTime/1000).toFixed(1)}с, интервал ${(shotInterval/1000).toFixed(1)}с`);
        
        let shotCount = 0;
        
        const shoot = () => {
            if (shotCount < 5 && this.isActive) {
                this.simulateShot(participant, shotCount);
                shotCount++;
                
                // Запускаем следующий выстрел
                if (shotCount < 5) {
                    setTimeout(shoot, shotInterval);
                } else {
                    // Завершаем стрельбу для этого участника
                    this.finishParticipantShooting(participant);
                }
            }
        };
        
        // Запускаем первый выстрел
        setTimeout(shoot, shotInterval);
    }
    
    // Завершение стрельбы для участника
    finishParticipantShooting(participant) {
        const results = this.results.get(participant);
        results.finished = true;
        results.shootingTime = this.calculateShootingTime(participant);
        
        console.log(`${participant.name} завершил стрельбу: ${results.hits}/5`);
        
        // Проверяем, все ли завершили
        this.checkAllFinished();
    }
    
    // Проверка завершения стрельбы всеми участниками
    checkAllFinished() {
        const allFinished = Array.from(this.results.values()).every(result => result.finished);
        
        if (allFinished) {
            console.log("Все участники завершили стрельбу");
            this.isActive = false;
            
            // Вызываем callback завершения
            if (this.onShootingFinished) {
                this.onShootingFinished(this.results);
            }
        }
    }
    
    // Получить результаты стрельбы
    getResults() {
        return this.results;
    }
    
    // Получить результаты конкретного участника
    getParticipantResults(participant) {
        return this.results.get(participant);
    }
    
    // Остановить стрельбу
    stopShooting() {
        this.isActive = false;
        console.log("Стрельба остановлена");
    }
    
    // Установить callback завершения стрельбы
    setFinishCallback(callback) {
        this.onShootingFinished = callback;
    }
}
