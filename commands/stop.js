const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const Ec2 = require(path.join(path.dirname(require.main.filename), 'util/ec2.js'));

const ARG1 = 'instance_name';

async function executeCommand(interaction) {
  const instance_name = interaction.options.getString(ARG1);
  const ec2 = await Ec2.build(instance_name);
  await ec2.stop_instance();
  const message = `${ec2.instance_name} is ${ec2.instance_state}`;
  return message;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('インスタンスを起動します')
    .addStringOption(option =>
      option
        .setName(ARG1)
        .setDescription('インスタンス名を入力してください')
        .setRequired(true)
    ),
	execute: async function(interaction) {
		await interaction.deferReply();
    const message = await executeCommand(interaction);
    await interaction.editReply(message);
	},
};
