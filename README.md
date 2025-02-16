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

3. Fork this project and Clone the repo to a hidden directory at called `.dotfiles`. This can be anywhere. I recommend `~/Documents/Personal/`. We will later create a symlink to the `.zshrc` in the Home directory.

```bash
git clone https://github.com/akin-fagbohun/dot-files.git ~/Documents/Personal/.dotfiles
```

4. Create a symlink between the `.dotfiles/.zshrc` in the repo and `.zshrc` in the Home directory. Doing this will allow you to easily commit your changes to your remote repository.
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

## Ghostty <> VS Code

`Ghostty` is my terminal application of choice, with `VS Code` being my current choice editor. To facilitate moving seemlessly between the two, I recommend creating an automation using the Automator app on macOS.

1. Launch `VSCode` and open the `keyboard shortcuts` settings pane. Unbind the default terminal shortcut by searching for it. (Typically ``CMD` ``). We'll be repurposing this keybind when creating an automation that launches `Ghostty`.

2. Open the `Automator` app (`CMD + Space` "Automator")

3. Select `Quick Action` under "Choose a type for your document"

4. In the right side pane, change `"workflow receives current"` value to `"no input"`

5. From the adjacent dropdown, find `VSCode`

6. From the `Library` shortlist in the middle pane, click and drag `Launch Application` into the right pane.

7. We're moving from `VSCode` to `Ghostty`, so select `Ghostty` as the application

8. Click `File`, `Save` and name your quick action. The name needs to match the name in `step 10`. e.g. `"Open Ghostty from VSCode"`

9. Next, go to your system settings, search for `Keyboard Shortcuts` and select `App Shortcuts`.

10. Add a new shortcut for `[Application: Visual Studio Code]`, `[Menu Title: "Open Ghostty from VSCode"]`, ``[Keyboard shortcut: CMD`]``

Now when you're in VSCode and hit ``CMD` ``, `Ghostty` will be launched or otherwise brought into view. Repeat the steps to configure the other direction. i.e. `Ghostty -> VSCode`

## ZSH Addons

I use ZSH, so this configuration adds a few convenience addons that drastically improve DX in the terminal.

* `git` aliases that I use. Add to or delete as you see fit. If deleting you may need to `unalias` and re `source .zshrc`
* [`Pure Prompt`](https://github.com/sindresorhus/pure)
* [`zoxide`](https://github.com/ajeetdsouza/zoxide) - configured to bind on `cd` in `.zshrc`
* [`fzf`](https://github.com/junegunn/fzf)