class BiathlonGame {
    constructor() {
        // Типы гонок
        this.raceTypes = {
            sprint: {
                name: "Спринт",
                distance: "3 км",
                totalSegments: 60,
                shootingRounds: [
                    { afterSegment: 20, position: "prone", name: "Стрельба лёжа" },
                    { afterSegment: 40, position: "standing", name: "Стрельба стоя" }
                ],
                description: "Короткая быстрая гонка с 2 стрельбами"
            },
            pursuit: {
                name: "Гонка преследования", 
                distance: "5 км",
                totalSegments: 100,
                shootingRounds: [
                    { afterSegment: 20, position: "prone", name: "Стрельба лёжа 1" },
                    { afterSegment: 40, position: "prone", name: "Стрельба лёжа 2" },
                    { afterSegment: 60, position: "standing", name: "Стрельба стоя 1" },
                    { afterSegment: 80, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Средняя дистанция с 4 стрельбами"
            },
            individual: {
                name: "Индивидуальная гонка",
                distance: "6 км", 
                totalSegments: 120,
                shootingRounds: [
                    { afterSegment: 24, position: "prone", name: "Стрельба лёжа 1" },
                    { afterSegment: 48, position: "prone", name: "Стрельба лёжа 2" },
                    { afterSegment: 72, position: "standing", name: "Стрельба стоя 1" },
                    { afterSegment: 96, position: "standing", name: "Стрельба стоя 2" }
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
                prone: 0.8,  // Точность лёжа 80%
                standing: 0.6 // Точность стоя 60%
            }
        };
        
        this.opponents = this.generateOpponents(15);
        this.allCompetitors = [this.player, ...this.opponents];
        
        console.log("Биатлон Менеджер с системой меню инициализирован!");
    }
    
    generateOpponents(count) {
        const names = [
            "Йоханссон", "Мюллер", "Мартен", "Ларссон", "Хубер", 
            "Бё", "Фуркад", "Самуэльссон", "Свендсен", "Устюгов",
            "Шипулин", "Логинов", "Лазуткин", "Пидно", "Берман"
        ];
        
        const flags = ["🇳🇴", "🇩🇪", "🇫🇷", "🇸🇪", "🇦🇹", "🇫🇮", "🇮🇹", "🇨🇭", "🇺🇦", "🇧🇾", "🇷🇺", "🇨🇿", "🇸🇰", "🇵🇱", "🇰🇿"];
        
        return Array.from({length: count}, (_, i) => {
            const baseSpeed = 4 + Math.random() * 3;
            const baseStamina = 80 + Math.random() * 20;
            
            return {
                name: names[i],
                flag: flags[i],
                speed: baseSpeed,
                stamina: baseStamina,
                maxStamina: baseStamina,
                pulse: 110 + Math.random() * 30,
                position: i + 1,
                time: i * 2.5,
                isPlayer: false,
                shooting: {
                    prone: 0.6 + Math.random() * 0.3,  // 60-90%
                    standing: 0.4 + Math.random() * 0.3 // 40-70%
                },
                // Характеристики для AI
                aggression: Math.random(), // Агрессивность (0-1)
                consistency: 0.7 + Math.random() * 0.3, // Стабильность (0.7-1.0)
                shootingSpeed: 1.5 + Math.random() * 1.5 // Скорость стрельбы (1.5-3.0 сек)
            };
        });
    }
    
    // Методы для главного меню
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
    
    getAllRaceTypes() {
        return this.raceTypes;
    }
    
    // Запуск гонки
    startRace(raceType = null) {
        if (this.isRacing) return false;
        
        if (raceType) {
            this.selectedRaceType = raceType;
        }
        
        this.currentRaceType = this.selectedRaceType;
        this.currentSegment = 1;
        this.totalTime = 0;
        this.isRacing = true;
        this.isShooting = false;
        this.currentShootingRound = null;
        
        // Сбрасываем позиции всех участников
        this.allCompetitors.forEach((competitor, index) => {
            competitor.time = index * 0.5; // Небольшой разрыв на старте
            competitor.position = index + 1;
            competitor.stamina = competitor.maxStamina;
            competitor.pulse = 120;
        });
        
        console.log(`Старт гонки: ${this.getCurrentRace().name}`);
        
        // Запускаем игровой цикл
        this.raceInterval = setInterval(() => {
            this.updateRace();
        }, 2000); // Обновление каждые 2 секунды (1 сегмент)
        
        return true;
    }
    
    updateRace() {
        const race = this.getCurrentRace();
        
        if (this.isShooting) return; // Не обновляем гонку во время стрельбы
        
        // Проверяем, нужно ли переходить к стрельбе
        const shootingRound = race.shootingRounds.find(round => 
            round.afterSegment === this.currentSegment
        );
        
        if (shootingRound && !this.isShooting) {
            this.startShooting(shootingRound);
            return;
        }
        
        if (this.currentSegment > race.totalSegments) {
            this.finishRace();
            return;
        }
        
        // Обновляем позиции всех участников
        this.updateCompetitors();
        
        this.currentSegment++;
        this.totalTime += 2; // 2 секунды на сегмент
        
        console.log(`Сегмент: ${this.currentSegment}/${race.totalSegments}`);
    }
    
    startShooting(shootingRound) {
        this.isShooting = true;
        this.currentShootingRound = shootingRound;
        
        console.log(`Началась ${shootingRound.name}`);
        
        // Симуляция стрельбы для всех участников
        this.simulateShootingRound();
        
        // Продолжаем гонку через 5 секунд (время на стрельбу)
        setTimeout(() => {
            this.finishShooting();
        }, 5000);
    }
    
    simulateShootingRound() {
        const round = this.currentShootingRound;
        
        this.allCompetitors.forEach(competitor => {
            const accuracy = competitor.shooting[round.position];
            const hits = this.calculateShootingHits(competitor, accuracy);
            const misses = 5 - hits;
            
            // Добавляем штрафное время за промахи
            const penaltyTime = misses * 10; // 10 секунд за промах
            competitor.time += penaltyTime;
            
            console.log(`${competitor.name}: ${hits}/5 (${misses} промахов, +${penaltyTime}сек)`);
        });
    }
    
    calculateShootingHits(competitor, baseAccuracy) {
        let hits = 0;
        for (let i = 0; i < 5; i++) {
            // Учитываем стабильность спортсмена
            const effectiveAccuracy = baseAccuracy * competitor.consistency;
            if (Math.random() < effectiveAccuracy) {
                hits++;
            }
        }
        return hits;
    }
    
    finishShooting() {
        this.isShooting = false;
        this.currentShootingRound = null;
        
        // Продолжаем гонку
        this.currentSegment++;
        console.log("Стрельба завершена, продолжаем гонку");
    }
    
    updateCompetitors() {
        // Обновляем позиции всех участников
        this.allCompetitors.forEach(competitor => {
            if (!competitor.isPlayer) {
                // AI логика для соперников
                const baseTimeChange = (10 / competitor.speed); // Базовое время на сегмент
                const variation = (Math.random() * 0.4 - 0.2) * competitor.consistency;
                const aggressionBonus = competitor.aggression * 0.1;
                
                const timeChange = baseTimeChange + variation - aggressionBonus;
                competitor.time = Math.max(0, competitor.time + timeChange);
                
                // Уменьшаем выносливость
                competitor.stamina = Math.max(0, competitor.stamina - 0.5);
                competitor.pulse = Math.min(180, competitor.pulse + 0.3);
            }
        });
        
        // Сортируем по времени
        this.allCompetitors.sort((a, b) => a.time - b.time);
        
        // Обновляем позиции
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
        
        // Возврат к нормальной скорости через 3 сегмента
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
    
    getCurrentRace() {
        return this.raceTypes[this.currentRaceType];
    }
    
    finishRace() {
        clearInterval(this.raceInterval);
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
    
    // Возврат в меню
    returnToMenu() {
        if (this.isRacing) {
            clearInterval(this.raceInterval);
            this.isRacing = false;
        }
        this.isShooting = false;
        this.currentShootingRound = null;
        
        console.log("Возврат в главное меню");
        return true;
    }
}