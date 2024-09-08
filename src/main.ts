import { world, system, Vector3, BlockPermutation, BlockComponentTypes, Block, BlockInventoryComponent, ItemStack } from "@minecraft/server";
import { MinecraftItemTypes } from "./type/item";

const overworld = world.getDimension("overworld");

// ゲームスタートコマンド
system.afterEvents.scriptEventReceive.subscribe(async (eventData) => {
    if (eventData.id === "bingo:start") { 
        if (eventData.sourceEntity) {
            await prepare_stage(eventData.sourceEntity.location);
        }
    }
});

async function prepare_stage(location: Vector3) {
    await prepare_frame(location.x - 10, location.y, location.z);
    setChest(location.x - 9, location.y + 1, location.z - 3);
    setChest(location.x - 9, location.y + 1, location.z + 3);
    world.sendMessage(`BINGOの準備ができました: x=${location.x}, y=${location.y}, z=${location.z}`);
}

// アイテムが詰まったチェストを用意する
function setChest(x: number, y: number, z: number) {
    const block = overworld.getBlock({x, y, z});
    if (block) {
        block.setType("chest");
        block.setPermutation(BlockPermutation.resolve("chest", {"facing_direction": 5}));
        getRandomItems(MinecraftItemTypes, 27);
        const inventory = block.getComponent(BlockComponentTypes.Inventory) as BlockInventoryComponent;
        if (inventory && inventory.container) {
            const items = getRandomItems(MinecraftItemTypes, 27);
            for (let i = 0; i < 27; i++) {
                inventory.container.addItem(new ItemStack(items[i].toString(), 1));
            }
        }
    }
}

function getRandomItems(itemTypes: typeof MinecraftItemTypes, count: number): MinecraftItemTypes[] {
    const itemsArray = Object.values(itemTypes);
    for (let i = itemsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [itemsArray[i], itemsArray[j]] = [itemsArray[j], itemsArray[i]];
    }
    return itemsArray.slice(0, count);
}

// 額縁をビンゴカードのように並べる
async function prepare_frame(x: number, y: number, z: number) {    
    await overworld.runCommandAsync(`fill ${x} ${y} ${z - 6} ${x + 7} ${y + 7} ${z + 6} air`);

    // location の左右にレンガの壁とその手前にレンガの床を作る
    await overworld.runCommandAsync(`fill ${x} ${y} ${z - 5} ${x} ${y + 7} ${z - 1} brick_block`);
    await overworld.runCommandAsync(`fill ${x} ${y} ${z + 1} ${x} ${y + 7} ${z + 5} brick_block`);
    await overworld.runCommandAsync(`fill ${x + 1} ${y} ${z - 5} ${x + 7} ${y} ${z - 1} brick_block`);
    await overworld.runCommandAsync(`fill ${x + 1} ${y} ${z + 1} ${x + 7} ${y} ${z + 5} brick_block`);
    
    // location の壁と床に額縁を並べる
    await overworld.runCommandAsync(`fill ${x + 1} ${y + 3} ${z - 5} ${x + 1} ${y + 7} ${z - 1} frame`);
    await overworld.runCommandAsync(`fill ${x + 1} ${y + 3} ${z + 1} ${x + 1} ${y + 7} ${z + 5} frame`);
    await overworld.runCommandAsync(`fill ${x + 3} ${y + 1} ${z - 5} ${x + 7} ${y + 1} ${z - 1} frame ["facing_direction"=1]`);
    await overworld.runCommandAsync(`fill ${x + 3} ${y + 1} ${z + 1} ${x + 7} ${y + 1} ${z + 5} frame ["facing_direction"=1]`);
}

function check_frame() {
    // testforblocks コマンドを使えばいけそう
}