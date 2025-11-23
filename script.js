// script.js

// --- 1. إعداد المشهد الأساسي ---
import { GLTFLoader } from './GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // سماء زرقاء
scene.fog = new THREE.Fog(0x87CEEB, 20, 150); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- 2. الإضاءة ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
dirLight.shadow.camera.left = -150;
dirLight.shadow.camera.right = 150;
dirLight.shadow.camera.top = 150;
dirLight.shadow.camera.bottom = -150;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 200;
dirLight.shadow.mapSize.width = 2048; 
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// --- 3. بناء الخريطة المعقدة (الجبال، القرية، النهر) ---
function createMap() {
    // أ. الأرضية الأساسية (أكبر قليلاً الآن)
    const groundGeometry = new THREE.PlaneGeometry(300, 300); // خريطة 300x300
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3b7d3b, // أخضر عشبي
        roughness: 0.8 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ب. إضافة الجبال (Mountain Range) - كتل كبيرة
    const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x5a4b41, roughness: 0.9 }); // لون صخري

    // جبل كبير على اليمين
    const mountain1Geo = new THREE.ConeGeometry(40, 60, 16);
    const mountain1 = new THREE.Mesh(mountain1Geo, mountainMaterial);
    mountain1.position.set(80, 30, -50);
    mountain1.castShadow = true;
    mountain1.receiveShadow = true;
    scene.add(mountain1);

    // جبل بعيد في الخلف (مع قمة بيضاء للثلج)
    const farMountainGeo = new THREE.ConeGeometry(50, 80, 16);
    const farMountainMaterial = new THREE.MeshStandardMaterial({ color: 0x6a5c52 });
    const farMountain = new THREE.Mesh(farMountainGeo, farMountainMaterial);
    farMountain.position.set(-100, 40, -120);
    farMountain.castShadow = true;
    farMountain.receiveShadow = true;
    scene.add(farMountain);
    
    // قمة ثلجية
    const snowCapGeo = new THREE.ConeGeometry(20, 15, 16);
    const snowCapMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const snowCap = new THREE.Mesh(snowCapGeo, snowCapMat);
    snowCap.position.set(-100, 75, -120);
    snowCap.castShadow = true;
    scene.add(snowCap);

    // ج. النهر (River)
    const riverGeometry = new THREE.BoxGeometry(20, 0.5, 250); // شريط طويل ورفيع
    const riverMaterial = new THREE.MeshStandardMaterial({ color: 0x42A5F5, transparent: true, opacity: 0.7, roughness: 0.1 }); // أزرق مائي شفاف
    const river = new THREE.Mesh(riverGeometry, riverMaterial);
    river.position.set(40, -0.1, 0); // يمر بمنتصف الخريطة تقريباً
    scene.add(river);

    // د. القرية (Village) - مبانٍ بسيطة
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 }); // بني خشبي

    // دالة مساعدة لإنشاء منزل
    function createHouse(x, z, sizeX, sizeZ) {
        const height = Math.random() * 3 + 4; // ارتفاع عشوائي
        const houseGeo = new THREE.BoxGeometry(sizeX, height, sizeZ);
        const house = new THREE.Mesh(houseGeo, buildingMaterial);
        house.position.set(x, height / 2, z);
        house.castShadow = true;
        house.receiveShadow = true;
        scene.add(house);

        // سقف المنزل
        const roofGeo = new THREE.ConeGeometry(Math.max(sizeX, sizeZ) / 1.5, height / 2, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x61341c }); // سقف أغمق
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(x, height + height / 4, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        scene.add(roof);
    }

    // بناء عدة منازل في منطقة معينة (مثلاً حول النقطة -50, -50)
    for (let i = 0; i < 10; i++) {
        const x = -50 + (Math.random() - 0.5) * 40;
        const z = -50 + (Math.random() - 0.5) * 40;
        const sizeX = Math.random() * 4 + 3;
        const sizeZ = Math.random() * 4 + 3;
        createHouse(x, z, sizeX, sizeZ);
    }

    // هـ. الأشجار المتفرقة
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });

    for (let i = 0; i < 50; i++) { 
        const x = (Math.random() - 0.5) * 250;
        const z = (Math.random() - 0.5) * 250;
        
        // لا تضع أشجار في النهر أو بالقرب جداً من القرية
        if ((x > 30 && x < 50) && (z > -120 && z < 120)) continue; 
        if ((x > -70 && x < -30) && (z > -70 && z < -30)) continue;

        const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 3, 8);
        const trunk = new THREE.Mesh(trunkGeo, treeTrunkMat);
        trunk.position.set(x, 1.5, z);
        trunk.castShadow = true;
        scene.add(trunk);

        const leavesGeo = new THREE.ConeGeometry(3, 6, 8);
        const leaves = new THREE.Mesh(leavesGeo, treeLeavesMat);
        leaves.position.set(x, 5, z);
        leaves.castShadow = true;
        scene.add(leaves);
    }
}
createMap();

// --- 4. اللاعب (Player) ---
const player = new THREE.Object3D(); // حاوية للاعب
player.position.set(0, 1, 0); // رفع اللاعب قليلاً فوق الأرض
scene.add(player);

let playerModel; // النموذج الفعلي (GLTF) سيتم تحميله هنا
const PLAYER_SPEED = 50; // سرعة اللاعب (وحدة/ثانية)
const velocity = new THREE.Vector3();
let lastTime = 0;

// --- 5. الأعداء (Enemies) ---
const enemies = [];
const ENEMY_COUNT = 31;
const ENEMY_SPEED = 10;
// تعريف ألوان الأسكنات للأعداء (مستوحاة من صور المستخدم)
const ENEMY_SKINS = [
    0x333333, // Dark Ops (الافتراضي)
    0x4682B4, // Camo Blue
    0x8B0000, // Red Squad
    0x006400  // Forest Green
];
const ENEMY_MATERIAL = new THREE.MeshStandardMaterial({ color: ENEMY_SKINS[0] });
const ENEMY_GEOMETRY = new THREE.BoxGeometry(1, 2, 1);

function createEnemy(x, z) {
    // اختيار سكن عشوائي للعدو
    const randomSkin = ENEMY_SKINS[Math.floor(Math.random() * ENEMY_SKINS.length)];
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: randomSkin });
    
    const enemy = new THREE.Mesh(ENEMY_GEOMETRY, enemyMaterial);
    enemy.position.set(x, 1, z);
    enemy.castShadow = true;
    scene.add(enemy);
    enemies.push(enemy);
}

// توليد الأعداء
for (let i = 0; i < ENEMY_COUNT; i++) {
    let x, z;
    do {
        x = (Math.random() - 0.5) * 250;
        z = (Math.random() - 0.5) * 250;
    } while (Math.abs(x) < 50 && Math.abs(z) < 50); // تجنب التولد بالقرب من اللاعب
    createEnemy(x, z);
}

document.getElementById('alive-count').textContent = ENEMY_COUNT + 1; // تحديث عداد الأحياء

// --- 6. تحميل النماذج (GLTF Loader) ---
const loader = new GLTFLoader();

function loadPlayerModel(modelPath) {
    // إزالة النموذج القديم إذا كان موجوداً
    if (playerModel) {
        player.remove(playerModel);
        playerModel.geometry.dispose();
        playerModel.material.dispose();
    }

    loader.load(
        modelPath,
        function (gltf) {
            playerModel = gltf.scene;
            // يتميز نموذج DamagedHelmet بأنه كبير جداً، لذا نحتاج إلى تصغيره
            playerModel.scale.set(5, 5, 5); 
            playerModel.position.y = 0; 
            playerModel.castShadow = true;
            playerModel.receiveShadow = true;
            player.add(playerModel);
            console.log("Player model loaded successfully!");
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the model:', error);
            // في حالة الفشل، نستخدم مكعب مؤقت
            const tempCube = new THREE.Mesh(
                new THREE.BoxGeometry(1, 2, 1),
                new THREE.MeshStandardMaterial({ color: 0xffcc00 })
            );
            tempCube.position.y = 1;
            player.add(tempCube);
            playerModel = tempCube;
        }
    );
}

// تحميل نموذج الخوذة كتجربة سكن
loadPlayerModel('./DamagedHelmet.glb'); // السطر المصحح للمسار

// --- 7. التحكم (Joystick Logic) ---
const joystickZone = document.getElementById('joystick-zone');
const joystickStick = document.getElementById('joystick');
let joystickCenter = { x: 0, y: 0 };
let touchId = null;
let joystickAngle = 0;
let isMoving = false;

joystickZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchId = touch.identifier;
    const rect = joystickZone.getBoundingClientRect();
    joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateJoystick(touch);
    isMoving = true;
});

joystickZone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for(let i=0; i<e.changedTouches.length; i++) {
        if(e.changedTouches[i].identifier === touchId) {
            updateJoystick(e.changedTouches[i]);
            break;
        }
    }
});

joystickZone.addEventListener('touchend', (e) => {
    e.preventDefault();
    isMoving = false;
    joystickStick.style.transform = `translate(-50%, -50%)`;
    velocity.set(0, 0, 0); // إيقاف الحركة عند رفع الإصبع
});

function updateJoystick(touch) {
    const maxDist = 40;
    let dx = touch.clientX - joystickCenter.x;
    let dy = touch.clientY - joystickCenter.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    joystickAngle = Math.atan2(dy, dx); 
    if (distance > maxDist) {
        dx = Math.cos(joystickAngle) * maxDist;
        dy = Math.sin(joystickAngle) * maxDist;
    }
    joystickStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    // تحديث متجه السرعة (Velocity Vector)
    // الحركة في Three.js تكون على محور X و Z
    // يجب عكس الزاوية لأن الشاشة تبدأ من الأعلى (Y)
    const angle = joystickAngle + Math.PI / 2;
    velocity.x = Math.cos(angle) * PLAYER_SPEED;
    velocity.z = Math.sin(angle) * PLAYER_SPEED;
}

// --- 8. حلقة اللعبة (Game Loop) ---
function animate(time) {
    requestAnimationFrame(animate);

    const delta = (time - lastTime) / 1000; // حساب دلتا تايم (Delta Time)
    lastTime = time;

    // تحديث حركة اللاعب باستخدام دلتا تايم (حركة احترافية)
    if (isMoving) {
        player.position.x += velocity.x * delta;
        player.position.z += velocity.z * delta;
        
        // تدوير اللاعب ليواجه اتجاه الحركة
        player.rotation.y = -joystickAngle - Math.PI / 2;
    }

    // تحديث حركة الأعداء (حركة عشوائية بسيطة)
    enemies.forEach(enemy => {
        // حركة عشوائية بسيطة (يمكن تحسينها لاحقاً)
        if (!enemy.targetPosition || enemy.position.distanceTo(enemy.targetPosition) < 5) {
            enemy.targetPosition = new THREE.Vector3(
                (Math.random() - 0.5) * 250,
                1,
                (Math.random() - 0.5) * 250
            );
        }
        
        const direction = enemy.targetPosition.clone().sub(enemy.position).normalize();
        enemy.position.x += direction.x * ENEMY_SPEED * delta;
        enemy.position.z += direction.z * ENEMY_SPEED * delta;
        
        // تدوير العدو ليواجه اتجاه الحركة
        enemy.rotation.y = Math.atan2(direction.x, direction.z);
    });

    // تحديث موقع الكاميرا (تتبع سلس)
    const targetPosition = new THREE.Vector3(player.position.x, player.position.y + 15, player.position.z + 20);
    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(player.position.x, player.position.y + 5, player.position.z);

    renderer.render(scene, camera);
}

animate(0);

// --- 9. التحكم في السكن والسلاح (زر المنظار) ---
const SKINS = [
    { name: "AK-47", color: 0x006400 }, // Forest Green
    { name: "M4A1", color: 0x4682B4 }, // Camo Blue
    { name: "Sniper", color: 0x8B0000 }, // Red Squad
    { name: "Heavy Gunner", color: 0x333333 } // Dark Ops
];
let currentSkinIndex = 0;

document.querySelector('.btn-scope').addEventListener('click', () => {
    currentSkinIndex = (currentSkinIndex + 1) % SKINS.length;
    const skin = SKINS[currentSkinIndex];

    // تغيير لون اللاعب (إذا كان مكعباً مؤقتاً)
    if (playerModel && playerModel.material) {
        playerModel.material.color.set(skin.color);
    }
    
    // تحديث اسم السلاح
    document.getElementById('gun-card').textContent = skin.name;
});

// --- 10. استجابة لتغيير حجم الشاشة ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
 
