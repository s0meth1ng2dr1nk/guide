```bash
git clone https://github.com/s0meth1ng2dr1nk/guide.git /opt/guide
cd /opt/guide
npm install
```

```bash
vi .env
# envs > guide > .env
```

```bash
cd /etc/systemd/system
ln -nfs /opt/guide/system/guide.service
systemctl daemon-reload
systemctl enable guide
systemctl start guide
```
