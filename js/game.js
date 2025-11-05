class BiathlonGame {
    constructor() {
        // Типы гонок
        this.raceTypes = {
            sprint: {
                name: "Спринт",
                distance: "3 км",
                trackLength: 150,
                totalLaps: 3,
                segmentsPerLap: 6,
                totalSegments: 18,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа" },
                    { afterLap: 2, position: "standing", name: "Стрельба стоя" }
                ],
                description: "Короткая быстрая гонка с 2 стрельбами"
            },
            pursuit: {
                name: "Гонка преследования", 
                distance: "5 км",
                trackLength: 150,
                totalLaps: 5,
                segmentsPerLap: 6,
                totalSegments: 30,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                    { afterLap: 2, position: "prone", name: "Стрельба лёжа 2" },
                    { afterLap: 3, position: "standing", name: "Стрельба стоя 1" },
                    { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Средняя дистанция с 4 стрельбами"
            },
            individual: {
                name: "Индивидуальная гонка",
                distance: "6 км", 
                trackLength: 150,
                totalLaps: 4,
                segmentsPerLap: 10,
                totalSegments: 40,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                    { afterLap: 2, position: "prone", name: "Стрельба лёжа 2" },
                    { afterLap: 3, position: "standing", name: "Стрельба стоя 1" },
                    { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Длинная дистанция с 4 стрельбами"
            }
        };

        // Текущее состояние игры
        this.selectedRaceType = "sprint";
        this.currentRaceType = "sprint";
        this.currentSegment = 1;
        this.totalTime = 0;
        this.isRacing = false;
        this.isShooting = false;
        this.currentShootingRound = null;
        this.raceInterval = null;
        this.shootingInterval = null;
        
        // Состояние стрельбы для всех участников
        this.currentShooterIndex = 0;
        this.shootingQueue = [];
        this.allShootingResults = new Map();
        this.currentShotIndex = 0;
        
        // Игрок
        this.player = {
            name: "Вы",
            flag: "🎯",
            speed: 5,
            stamina: 100,
            maxStamina: 100,
            pulse: 120,
            position: 4,
            time: 18.3,
            isPlayer: true,
            shooting: {
                prone: 0.8,
                standing: 0.6
            },
            aggression: 0.7,
            consistency: 0.8,
            shootingSpeed: 2.0
        };
        
        this.opponents = this.generateOpponents(15);
        this.allCompetitors = [this.player, ...this.opponents];
        
        console.log("Биатлон Менеджер инициализирован!");
    }
    
    generateOpponents(count) {
        const names = ["Йоханссон", "Мюллер", "Мартен", "Ларссон", "Хубер", "Бё", "Фуркад"];
        const flags = ["🇳🇴", "🇩🇪", "🇫🇷", "🇸🇪", "🇦🇹", "🇫🇮", "🇮🇹"];
        
        return Array.from({length: count}, (_, i) => {
            const baseSpeed = 4 + Math.random() * 3;
            const baseStamina = 80 + Math.random() * 20;
            
            return {
                name: names[i % names.length],
                flag: flags[i % flags.length],
                speed: baseSpeed,
                stamina: baseStamina,
                maxStamina: baseStamina,
                pulse: 110 + Math.random() * 30,
                position: i + 1,
                time: i * 2.5,
                isPlayer: false,
                shooting: {
                    prone: 0.6 + Math.random() * 0.3,
                    standing: 0.4 + Math.random() * 0.3
                },
                aggression: Math.random(),
                consistency: 0.7 + Math.random() * 0.3,
                shootingSpeed: 1.5 + Math.random() * 1.5
            };
        });
    }
    
    // Расчет текущего круга
    getCurrentLap() {
        const race = this.getCurrentRace();
        return Math.ceil(this.currentSegment / race.segmentsPerLap);
    }

    getCurrentSegmentInLap() {
        const race = this.getCurrentRace();
        return this.currentSegment % race.segmentsPerLap || race.segmentsPerLap;
    }
    
    selectRaceType(raceType) {
        if (this.raceTypes[raceType]) {
            this.selectedRaceType = raceType;
            console.log(`Выбрана гонка: ${this.raceTypes[raceType].name}`);
            return true;
        }
        return false;
    }
    
    getSelectedRace() {
        return this.raceTypes[this.selectedRaceType];
    }
    
    getCurrentRace() {
        return this.raceTypes[this.currentRaceType];
    }
    
    getAllRaceTypes() {
        return this.raceTypes;
    }
    
    // Запуск гонки
    startRace(raceType = null) {
        console.log("=== START RACE ===");
        
        // Очищаем предыдущий интервал если гонка уже идет
        if (this.isRacing) {
            clearInterval(this.raceInterval);
            if (this.shootingInterval) {
                clearInterval(this.shootingInterval);
            }
        }
        
        if (raceType) {
            this.selectedRaceType = raceType;
        }
        
        this.currentRaceType = this.selectedRaceType;
        this.currentSegment = 1;
        this.totalTime = 0;
        this.isRacing = true;
        this.isShooting = false;
        this.currentShootingRound = null;
        this.currentShooterIndex = 0;
        this.currentShotIndex = 0;
        this.shootingQueue = [];
        this.allShootingResults.clear();
        
        console.log("Параметры гонки установлены");
        console.log("Тип гонки:", this.currentRaceType);
        
        // Сбрасываем позиции всех участников
        this.allCompetitors.forEach((competitor, index) => {
            competitor.time = index * 0.5;
            competitor.position = index + 1;
            competitor.stamina = competitor.maxStamina;
            competitor.pulse = 120;
        });
        
        console.log(`Старт гонки: ${this.getCurrentRace().name}`);
        
        // Запускаем игровой цикл
        this.raceInterval = setInterval(() => {
            this.updateRace();
        }, 2000);
        
        console.log("Игровой цикл запущен");
        return true;
    }
    
    updateRace() {
        if (this.isShooting) return;
        
        const race = this.getCurrentRace();
        
        console.log(`Сегмент: ${this.currentSegment}/${race.totalSegments}`);
        
        // Обновляем UI
        if (window.gameUI) {
            window.gameUI.updateDisplay();
        }
        
        // Проверяем стрельбу в конце круга
        const currentLap = this.getCurrentLap();
        const isEndOfLap = this.currentSegment % race.segmentsPerLap === 0;
        
        const shootingRound = race.shootingRounds.find(round => 
            round.afterLap === currentLap && isEndOfLap
        );
        
        if (shootingRound && !this.isShooting) {
            console.log(`🚨 Найдена стрельба: ${shootingRound.name}`);
            this.startShooting(shootingRound);
            return;
        }
        
        if (this.currentSegment >= race.totalSegments) {
            this.finishRace();
            return;
        }
        
        // Обновляем позиции всех участников
        this.updateCompetitors();
        
        this.currentSegment++;
        this.totalTime += 2;
    }
    
    startShooting(shootingRound) {
        console.log(`🎯 СТАРТ СТРЕЛЬБЫ: ${shootingRound.name}`);
        this.isShooting = true;
        this.currentShootingRound = shootingRound;
        this.currentShooterIndex = 0;
        this.currentShotIndex = 0;
        
        // Создаем очередь стрельбы (все участники)
        this.shootingQueue = [...this.allCompetitors];
        this.allShootingResults.clear();
        
        // Инициализируем результаты стрельбы для всех участников
        this.allCompetitors.forEach(competitor => {
            this.allShootingResults.set(competitor, {
                hits: 0,
                misses: 0,
                shots: [null, null, null, null, null], // 5 выстрелов
                finished: false,
                penaltyTime: 0
            });
        });
        
        // Показываем экран стрельбы
        if (window.gameUI) {
            window.gameUI.showShootingScreen(shootingRound, this.allCompetitors);
        }
        
        // Запускаем процесс стрельбы
        this.startNextShooter();
    }
    
    startNextShooter() {
        if (this.currentShooterIndex >= this.shootingQueue.length) {
            // Все отстреляли
            this.finishShooting();
            return;
        }
        
        const currentShooter = this.shootingQueue[this.currentShooterIndex];
        this.currentShotIndex = 0;
        
        console.log(`🎯 Стреляет: ${currentShooter.name}`);
        
        // Обновляем UI для текущего стрелка
        if (window.gameUI) {
            window.gameUI.setCurrentShooter(this.currentShooterIndex, currentShooter);
        }
        
        // Запускаем стрельбу для текущего участника
        this.startShooterSequence(currentShooter);
    }
    
    startShooterSequence(shooter) {
        const shootingSpeed = shooter.shootingSpeed * 1000; // преобразуем в миллисекунды
        
        // Симулируем 5 выстрелов с интервалом
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.simulateShot(shooter, i);
            }, i * shootingSpeed);
        }
        
        // После завершения стрельбы переходим к следующему участнику
        setTimeout(() => {
            this.finishShooter(shooter);
        }, 5 * shootingSpeed + 500);
    }
    
    simulateShot(shooter, shotIndex) {
        const round = this.currentShootingRound;
        const accuracy = shooter.shooting[round.position];
        const effectiveAccuracy = accuracy * shooter.consistency;
        const isHit = Math.random() < effectiveAccuracy;
        
        // Сохраняем результат выстрела
        const results = this.allShootingResults.get(shooter);
        results.shots[shotIndex] = isHit;
        
        if (isHit) {
            results.hits++;
        } else {
            results.misses++;
        }
        
        this.currentShotIndex = shotIndex + 1;
        
        // Обновляем UI мишени
        if (window.gameUI) {
            window.gameUI.updateShooterTarget(shooter, shotIndex, isHit);
        }
        
        console.log(`${shooter.name}: выстрел ${shotIndex + 1} - ${isHit ? 'ПОПАДАНИЕ!' : 'ПРОМАХ'}`);
    }
    
    finishShooter(shooter) {
        const results = this.allShootingResults.get(shooter);
        results.finished = true;
        results.penaltyTime = results.misses * 10; // 10 секунд штрафа за каждый промах
        
        // Добавляем штрафное время
        shooter.time += results.penaltyTime;
        
        console.log(`${shooter.name} завершил стрельбу: ${results.hits}/5, штраф: +${results.penaltyTime}сек`);
        
        // Обновляем UI
        if (window.gameUI) {
            window.gameUI.finishShooter(this.currentShooterIndex, shooter, results);
        }
        
        // Переходим к следующему стрелку
        this.currentShooterIndex++;
        
        // Небольшая пауза перед следующим стрелком
        setTimeout(() => {
            this.startNextShooter();
        }, 1000);
    }
    
    finishShooting() {
        console.log("🎯 ВСЕ УЧАСТНИКИ ЗАВЕРШИЛИ СТРЕЛЬБУ");
        
        // Обновляем прогресс
        if (window.gameUI) {
            window.gameUI.updateShootingProgress(100, "Все участники завершили стрельбу");
        }
        
        // Ждем 2 секунды и продолжаем гонку
        setTimeout(() => {
            this.isShooting = false;
            this.currentShootingRound = null;
            this.currentSegment++;
            
            // Пересчитываем позиции после штрафного времени
            this.allCompetitors.sort((a, b) => a.time - b.time);
            this.allCompetitors.forEach((competitor, index) => {
                competitor.position = index + 1;
            });
            
            // Скрываем экран стрельбы
            if (window.gameUI) {
                window.gameUI.hideShootingScreen();
            }
            
            console.log("Стрельба завершена, продолжаем гонку");
        }, 2000);
    }
    
    updateCompetitors() {
        this.allCompetitors.forEach(competitor => {
            if (!competitor.isPlayer) {
                const baseTimeChange = (10 / competitor.speed);
                const variation = (Math.random() * 0.4 - 0.2) * competitor.consistency;
                const aggressionBonus = competitor.aggression * 0.1;
                
                const timeChange = baseTimeChange + variation - aggressionBonus;
                competitor.time = Math.max(0, competitor.time + timeChange);
                
                competitor.stamina = Math.max(0, competitor.stamina - 0.5);
                competitor.pulse = Math.min(180, competitor.pulse + 0.3);
            }
        });
        
        this.allCompetitors.sort((a, b) => a.time - b.time);
        
        this.allCompetitors.forEach((competitor, index) => {
            competitor.position = index + 1;
        });
    }
    
    activateSprint() {
        if (this.player.stamina < 20) {
            return false;
        }
        
        this.player.speed += 2;
        this.player.stamina -= 15;
        this.player.pulse = Math.min(180, this.player.pulse + 20);
        
        console.log("Спринт активирован!");
        
        setTimeout(() => {
            this.player.speed = Math.max(5, this.player.speed - 2);
        }, 6000);
        
        return true;
    }
    
    activateSlowPace() {
        this.player.speed = Math.max(3, this.player.speed - 1);
        this.player.stamina = Math.min(100, this.player.stamina + 10);
        this.player.pulse = Math.max(100, this.player.pulse - 10);
        
        console.log("Темп снижен");
        return true;
    }
    
    finishRace() {
        clearInterval(this.raceInterval);
        if (this.shootingInterval) {
            clearInterval(this.shootingInterval);
        }
        this.isRacing = false;
        
        const playerPosition = this.player.position;
        let message = `Гонка завершена! Ваше место: ${playerPosition}`;
        
        if (playerPosition === 1) message += " 🥇 ПОБЕДА!";
        else if (playerPosition === 2) message += " 🥈";
        else if (playerPosition === 3) message += " 🥉";
        
        console.log(message);
        alert(message);
        
        return playerPosition;
    }
    
    returnToMenu() {
        if (this.isRacing) {
            clearInterval(this.raceInterval);
            if (this.shootingInterval) {
                clearInterval(this.shootingInterval);
            }
            this.isRacing = false;
        }
        this.isShooting = false;
        this.currentShootingRound = null;
        
        console.log("Возврат в главное меню");
        return true;
    }
}
