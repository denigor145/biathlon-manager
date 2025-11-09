class ShootingEngine {
    constructor() {
        this.isActive = false;
        this.currentShooter = null;
        this.shotCallbacks = new Map();
        
        console.log("ShootingEngine инициализирован");
    }
    
    // Начать стрельбу для участника
    startShooting(competitor, shootingRound) {
        if (this.isActive) {
            console.error("Стрельба уже активна для другого участника");
            return false;
        }
        
        this.isActive = true;
        this.currentShooter = competitor;
        competitor.isShooting = true;
        competitor.currentShootingRound = shootingRound;
        competitor.shotsFired = 0;
        competitor.shootingResults = [];
        
        console.log(`${competitor.name} начинает стрельбу: ${shootingRound.name}`);
        
        // Запускаем процесс стрельбы
        this.processShooting(competitor);
        
        return true;
    }
    
    // Процесс стрельбы
    processShooting(competitor) {
        if (!this.isActive || !competitor.isShooting) return;
        
        if (competitor.shotsFired < 5) {
            // Делаем выстрел
            setTimeout(() => {
                if (this.isActive && competitor.isShooting) {
                    this.makeShot(competitor);
                    this.processShooting(competitor); // Рекурсивно продолжаем
                }
            }, competitor.shootingInterval * 1000);
        } else {
            // Завершаем стрельбу
            this.finishShooting(competitor);
        }
    }
    
    // Совершение выстрела
    makeShot(competitor) {
        const shootingRound = competitor.currentShootingRound;
        const accuracy = competitor.shooting[shootingRound.position];
        const consistency = competitor.consistency || 0.8;
        
        // Эффективная точность с учетом консистентности
        const effectiveAccuracy = accuracy * consistency;
        const isHit = Math.random() < effectiveAccuracy;
        
        competitor.shootingResults.push(isHit);
        competitor.shotsFired++;
        
        console.log(`${competitor.name}: выстрел ${competitor.shotsFired} - ${isHit ? 'ПОПАДАНИЕ' : 'ПРОМАХ'} (точность: ${Math.round(effectiveAccuracy * 100)}%)`);
        
        // Вызываем callback выстрела, если есть
        if (this.shotCallbacks.has(competitor.id)) {
            this.shotCallbacks.get(competitor.id)(competitor.shotsFired - 1, isHit);
        }
        
        // Обновляем UI
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
    
    // Завершение стрельбы
    finishShooting(competitor) {
        this.isActive = false;
        competitor.isShooting = false;
        
        const misses = competitor.shootingResults.filter(result => !result).length;
        console.log(`${competitor.name} завершил стрельбу: ${5 - misses}/5`);
        
        // Вызываем callback завершения стрельбы, если есть
        if (this.shotCallbacks.has(competitor.id)) {
            this.shotCallbacks.get(competitor.id)(null, null, true);
        }
        
        this.currentShooter = null;
    }
    
    // Остановить стрельбу
    stopShooting() {
        if (this.isActive && this.currentShooter) {
            this.currentShooter.isShooting = false;
            this.currentShooter.shotsFired = 0;
            this.currentShooter.shootingResults = [];
        }
        
        this.isActive = false;
        this.currentShooter = null;
        console.log("Стрельба остановлена");
    }
    
    // Установить callback для выстрелов
    setShotCallback(competitorId, callback) {
        this.shotCallbacks.set(competitorId, callback);
    }
    
    // Удалить callback
    removeShotCallback(competitorId) {
        this.shotCallbacks.delete(competitorId);
    }
    
    // Получить текущего стрелка
    getCurrentShooter() {
        return this.currentShooter;
    }
    
    // Проверить, активна ли стрельба
    isShootingActive() {
        return this.isActive;
    }
    
    // Получить прогресс стрельбы в процентах
    getShootingProgress(competitor) {
        if (!competitor.isShooting) return 100;
        return (competitor.shotsFired / 5) * 100;
    }
    
    // Получить результаты стрельбы
    getShootingResults(competitor) {
        return {
            hits: competitor.shootingResults.filter(result => result).length,
            misses: competitor.shootingResults.filter(result => !result).length,
            shots: [...competitor.shootingResults],
            finished: !competitor.isShooting && competitor.shootingResults.length === 5
        };
    }
}
