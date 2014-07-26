
all: test

test:
	@mocha server_test/helper server_test --recursive

.PHONY: test
