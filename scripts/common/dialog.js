import { commonRoll, weaponRoll, damageRoll } from "./roll.js";

export async function prepareCustomRoll(rollData) {
  const html = await renderTemplate("systems/wrath-and-glory/template/dialog/custom-roll.html", rollData);
  let dialog = new Dialog({
    title: game.i18n.localize(rollData.name),
    content: html,
    buttons: {
      roll: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("BUTTON.ROLL"),
        callback: async (html) => {
          rollData.name = game.i18n.localize(rollData.name);
          rollData.difficulty.target = parseInt(html.find("#dn")[0].value, 10);
          rollData.pool.size = parseInt(html.find("#pool")[0].value, 10);
          await commonRoll(rollData);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("BUTTON.CANCEL"),
        callback: () => { },
      },
    },
    default: "roll",
    close: () => { },
  }, { width: 200 });
  dialog.render(true);
}

export async function prepareCommonRoll(rollData) {
  const html = await renderTemplate("systems/wrath-and-glory/template/dialog/common-roll.html", rollData);
  let dialog = new Dialog({
    title: game.i18n.localize(rollData.name),
    content: html,
    buttons: {
      roll: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("BUTTON.ROLL"),
        callback: async (html) => {
          rollData.name = game.i18n.localize(rollData.name);
          rollData.difficulty.target = parseInt(html.find("#target")[0].value, 10);
          rollData.difficulty.penalty = parseInt(html.find("#penalty")[0].value, 10);
          rollData.pool.size = parseInt(html.find("#size")[0].value, 10);
          rollData.pool.bonus = parseInt(html.find("#bonus")[0].value, 10);
          await commonRoll(rollData);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("BUTTON.CANCEL"),
        callback: () => { },
      },
    },
    default: "roll",
    close: () => { },
  }, { width: 200 });
  dialog.render(true);
}

export async function preparePsychicRoll(rollData) {
  const html = await renderTemplate("systems/wrath-and-glory/template/dialog/common-roll.html", rollData);
  let dialog = new Dialog({
    title: rollData.name,
    content: html,
    buttons: {
      roll: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("BUTTON.ROLL"),
        callback: async (html) => {
          rollData.name = rollData.name;
          rollData.difficulty.target = parseInt(html.find("#target")[0].value, 10);
          rollData.difficulty.penalty = parseInt(html.find("#penalty")[0].value, 10);
          rollData.pool.size = parseInt(html.find("#size")[0].value, 10);
          rollData.pool.bonus = parseInt(html.find("#bonus")[0].value, 10);
          await commonRoll(rollData);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("BUTTON.CANCEL"),
        callback: () => { },
      },
    },
    default: "roll",
    close: () => { },
  }, { width: 200 });
  dialog.render(true);
}

export async function prepareWeaponRoll(rollData) {
  rollData.difficulty.target = _getTargetDefense();
  const html = await renderTemplate("systems/wrath-and-glory/template/dialog/weapon-roll.html", rollData);
  let dialog = new Dialog({
    title: rollData.name,
    content: html,
    buttons: {
      roll: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("BUTTON.ROLL"),
        callback: async (html) => {
          rollData.name = rollData.name;
          rollData.difficulty.target = parseInt(html.find("#target")[0].value, 10);
          rollData.difficulty.penalty = parseInt(html.find("#penalty")[0].value, 10);
          rollData.pool.size = parseInt(html.find("#size")[0].value, 10);
          rollData.pool.bonus = parseInt(html.find("#bonus")[0].value, 10);
          rollData.weapon.damage = parseInt(html.find("#damage")[0].value, 10);
          rollData.weapon.bonus = parseInt(html.find("#damage-bonus")[0].value, 10);
          rollData.weapon.ed = parseInt(html.find("#ed")[0].value, 10);
          rollData.weapon.ap = parseInt(html.find("#ap")[0].value, 10);
          await weaponRoll(rollData);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("BUTTON.CANCEL"),
        callback: () => { },
      },
    },
    default: "roll",
    close: () => { },
  }, { width: 200 });
  dialog.render(true);
}

export async function prepareDamageRoll(rollData) {
  const html = await renderTemplate("systems/wrath-and-glory/template/dialog/damage-roll.html", rollData);
  let dialog = new Dialog({
    title: rollData.name,
    content: html,
    buttons: {
      roll: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("BUTTON.ROLL"),
        callback: async (html) => {
          rollData.name = game.i18n.localize(rollData.name);
          rollData.weapon.damage = parseInt(html.find("#damage")[0].value, 10);
          rollData.weapon.bonus = parseInt(html.find("#damage-bonus")[0].value, 10);
          rollData.weapon.ed = parseInt(html.find("#ed")[0].value, 10);
          rollData.weapon.ap = parseInt(html.find("#ap")[0].value, 10);
          await damageRoll(rollData);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("BUTTON.CANCEL"),
        callback: () => { },
      },
    },
    default: "roll",
    close: () => { },
  }, { width: 200 });
  dialog.render(true);
}

function _getTargetDefense(combat) {
  const target = game.user.targets.values().next().value;
  if (target === undefined) {
    return 3;
  } else {
    return target.actor.data.data.combat.defense.total;
  }
}