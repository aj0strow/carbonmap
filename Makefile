
all: test

test:
	@mocha server_test --recursive

.PHONY: test
