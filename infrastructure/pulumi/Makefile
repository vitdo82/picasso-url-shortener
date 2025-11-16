.PHONY: install init preview up down destroy outputs logs

install: ## Install dependencies
	npm install

init: ## Initialize Pulumi stack
	pulumi stack init production || true
	pulumi stack select production

preview: ## Preview infrastructure changes
	pulumi preview

up: ## Deploy infrastructure
	pulumi up

down: ## Destroy infrastructure
	pulumi destroy

outputs: ## Show stack outputs
	pulumi stack output

logs: ## View deployment logs
	pulumi logs

config-set: ## Set configuration (usage: make config-set KEY=value)
	@pulumi config set url-shortener:$(KEY) $(VALUE)

config-get: ## Get configuration (usage: make config-get KEY=name)
	@pulumi config get url-shortener:$(KEY)

config-secret: ## Set secret configuration (usage: make config-secret KEY=dbPassword VALUE=password)
	@pulumi config set --secret url-shortener:$(KEY) $(VALUE)

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

