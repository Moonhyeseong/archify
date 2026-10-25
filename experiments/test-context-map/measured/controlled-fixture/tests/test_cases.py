import pytest
import domain

@pytest.mark.parametrize("values, expected", [([1, 2], 3), ([2, 3], 5)], ids=["a|b", "two"])
def test_parameterized(values, expected, arithmetic_lifecycle):
    assert domain.total(values) == expected
    assert arithmetic_lifecycle == 10

def test_setup_failure(controlled_setup_failure):
    assert False, "This call body must not be reached"

def test_call_failure():
    assert domain.total([1, 2]) == 99, "DESIGNED call failure"

def test_teardown_failure(controlled_teardown_failure):
    assert controlled_teardown_failure == 1
