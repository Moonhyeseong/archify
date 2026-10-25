import pytest
import domain

@pytest.fixture
def arithmetic_lifecycle():
    assert domain.classify(1) == "nonnegative"
    yield domain.BASE
    assert domain.classify(-1) == "negative"

@pytest.fixture
def controlled_setup_failure():
    assert domain.total([1, 1]) == 3, "DESIGNED setup failure"

@pytest.fixture
def controlled_teardown_failure():
    yield 1
    assert domain.total([2, 2]) == 5, "DESIGNED teardown failure"
