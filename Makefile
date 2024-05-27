.PHONY: help install clean git-hooks all test
.DEFAULT_GOAL := install

help: ## Display this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.gitignore:
	curl -q "https://www.toptal.com/developers/gitignore/api/visualstudiocode,node,direnv" > $@

.git: .gitignore
	git init

.pre-commit-config.yaml: $(PRE_COMMIT_PATH) .git
	curl https://gist.githubusercontent.com/bengosney/4b1f1ab7012380f7e9b9d1d668626143/raw/.pre-commit-config.yaml > $@
	@touch $@

.git/hooks/%: .git $(PRE_COMMIT_PATH)
	pre-commit install --hook-type $(notdir $@)

git-hooks: .git .git/hooks/pre-commit .git/hooks/commit-msg ## Install git hooks

node_modules: package.json package-lock.json
	npm install
	@touch $@

install: node_modules .git git-hooks ## Install development requirements (default)

clean: ## Remove all generated files
	rm -rf *.png
