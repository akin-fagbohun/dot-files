# dot-files
The dotfiles contained within this repository are what I use to bootstrap my dev environment.

These are safe operations. If the Command Line presents problems with these, slap a `sudo` in front. 

## Steps to bootstrap a new machine
1. Use the default Terminal to install Apple's Command Line Tools. We'll need this in order to install `Git` and `Homebrew`.
```bash
xcode-select --install
```

2. Configure SSH
[Gitlab Docs](https://docs.gitlab.com/ee/user/ssh.html)
[Github Docs](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

3. Fork this project and Clone the repo to a hidden directory at called `.dotfiles`. This can be anywhere. I recommend `~/Documents/Personal/`. We will later create a symlink to the `.gitconfig` and `.zshrc` in the Home directory.

```bash
git clone https://github.com/akin-fagbohun/dot-files.git ~/Documents/Personal/.dotfiles
```

4. Create a symlinks between the `.dotfiles/.zshrc` in the repo and `.zshrc` in the Home directory. Doing this will allow you to easily commit your changes to your remote repository.
```bash
ln -s ~/Documents/Personal/.dotfiles/.zshrc ~/.zshrc
```

5. Install Homebrew from Safari then run the following command.
```bash
brew bundle --file ~/Documents/Personal/dotfiles/Brewfile
```

Alternatively
```bash
cd ~/Documents/Personal/.dotfiles && brew bundle
```