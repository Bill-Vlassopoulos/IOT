import numpy as np


# 3x1 + 7 + lambda - m1 = 0
# 2x2 + 5 + lambda -m2 = 0
# x3 + 3 + lambda = 0
# x1 + x2 + x3 = 10
# 2-x1=0
# 3-x2=0


# Coefficients matrix


# Coefficients matrix
A = np.array(
    [
        [3, 0, 0, 1, -1, 0],
        [0, 2, 0, 1, 0, -1],
        [0, 0, 1, 1, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
    ]
)

# Constants vector
b = np.array([-7, -5, -3, 10, 2, 3])

# Solve the system
solution = np.linalg.solve(A, b)

# Round the solution to 4 decimal places
rounded_solution = [round(x, 4) for x in solution]

print("Solution with 4 decimals:", rounded_solution)


def f(x1, x2, x3, l, m1, m2):
    return (
        1.5 * x1**2
        + 7 * x1
        + x2**2
        + 5 * x2
        + 0.5 * x3**2
        + 3 * x3
        + l * (x1 + x2 + x3 - 10)
        + m1 * (2 - x1)
        + m2 * (3 - x2)
    )


# Pass the solution to the function f
result = f(*rounded_solution)
print("Result of f with the solution:", result)

# Pass the solution to the function f
# result = f(*rounded_solution)
# print("Result of f with the solution:", result)
