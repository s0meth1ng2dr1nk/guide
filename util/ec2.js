const {setTimeout} = require("timers/promises");
const { 
  EC2Client, 
  DescribeInstancesCommand, 
  StartInstancesCommand,
  StopInstancesCommand,
} = require("@aws-sdk/client-ec2");
const config = {
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
};
const client = new EC2Client(config);

class Ec2 {
  constructor() {
    this.instance_name = '';
    this.instance_id = '';
    this.instance_input = '';
    this.instance_ip = '';
    this.instance_state = '';
  }

  static async build(instance_name) {
    const ec2 = new Ec2();
    ec2.instance_name = instance_name;
    ec2.instance_id = await ec2.get_instance_id();
    ec2.instance_input = {
      "InstanceIds": [
        ec2.instance_id,
      ]
    };
    return ec2;
  } 

  async get_instance_id() {
    const input = {
      Filters: [{
        "Name": "tag:Name",
        "Values": [
          this.instance_name
        ],
      }],
    };
    const command = new DescribeInstancesCommand(input);
    const response = await client.send(command);
    if (response.Reservations.length == 0) {
      throw new Error('インスタンスが存在しません');
    }
    if (response.Reservations[0].Instances.length > 1) {
      throw new Error('インスタンス名が被っています');
    } 
    return response.Reservations[0].Instances[0].InstanceId;
  }

  async get_discribe() {
    const command = new DescribeInstancesCommand(this.instance_input);
    const response = await client.send(command);
    if (response.Reservations.length == 0) {
      throw new Error('インスタンスが存在しません');
    }
    return response.Reservations[0].Instances[0];
  }

  async get_state(instance) {
    return instance.State.Name;
  }
  
  async get_ip(instance) {
    return instance.PublicIpAddress;
  }

  async start_instance() {
    const command = new StartInstancesCommand(this.instance_input);
    const response = await client.send(command);
    const status_code = response.$metadata.httpStatusCode;
    if (status_code != 200) {
      throw new Error('インスタンスの起動に失敗しました');
    }
    let instance = await this.get_discribe();
    let state = await this.get_state(instance);
    let ip = await this.get_ip(instance);
    while (state != 'running' || typeof ip === "undefined") {
      await setTimeout(1000);
      instance = await this.get_discribe();
      state = await this.get_state(instance);
      ip = await this.get_ip(instance);
    }
    this.instance_state = state;
    this.instance_ip = ip;
  }

  async stop_instance() {
    const command = new StopInstancesCommand(this.instance_input);
    const response = await client.send(command);
    const status_code = response.$metadata.httpStatusCode;
    if (status_code != 200) {
      throw new Error('インスタンスの停止に失敗しました');
    }
    let instance = await this.get_discribe();
    let state = await this.get_state(instance);
    while (state != 'stopped') {
      await setTimeout(1000);
      instance = await this.get_discribe();
      state = await this.get_state(instance);
    }
    this.instance_ip = '';
    this.instance_state = state;
  }
}

module.exports = Ec2;
