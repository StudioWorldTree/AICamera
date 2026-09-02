"""AGX Thor Developer Kit two-part resin fit-check shell.

NVIDIA kit envelope: 243.19 x 112.40 x 56.88 mm.
This script works in metres. STL export uses scale 1000 (mm).
Each half is sized to fit a ~192 x 120 mm resin bed.
"""
import bpy
from mathutils import Vector

# metres
KIT = Vector((0.24319, 0.11240, 0.05688))
CLEAR = 0.0015
WALL = 0.0022
INNER = KIT + Vector((2 * CLEAR, 2 * CLEAR, 2 * CLEAR))
OUTER = INNER + Vector((2 * WALL, 2 * WALL, 2 * WALL))
LIP = 0.005


def wipe_meshes():
    bpy.ops.object.select_all(action="DESELECT")
    for obj in list(bpy.data.objects):
        if obj.type == "MESH":
            bpy.data.objects.remove(obj, do_unlink=True)


def add_cube(name, dims, loc=(0, 0, 0)):
    # size=1 cube spans 1 m; scale by full dims so world size == dims.
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = Vector(dims)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return obj


def add_cyl(name, radius, depth, loc, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth, location=loc, rotation=rot, vertices=48
    )
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return obj


def apply_bool(target, tool, op="DIFFERENCE"):
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = target
    target.select_set(True)
    mod = target.modifiers.new(name=f"b_{tool.name}", type="BOOLEAN")
    mod.operation = op
    mod.solver = "MANIFOLD"
    mod.object = tool
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(tool, do_unlink=True)


def solidify(obj, thickness):
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    mod = obj.modifiers.new(name="solid", type="SOLIDIFY")
    mod.thickness = thickness
    mod.offset = -1  # inward
    bpy.ops.object.modifier_apply(modifier=mod.name)


def hollow_box(name, dims, loc):
    obj = add_cube(name, dims, loc)
    solidify(obj, WALL)
    return obj


def build():
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.unit_settings.length_unit = "METERS"
    wipe_meshes()

    kit = add_cube("KIT_DUMMY", KIT)
    kit.display_type = "WIRE"

    # Two overlapping halves along X (length)
    half_x = OUTER.x / 2.0 + LIP
    front_loc = (-(OUTER.x - half_x) / 2.0, 0, 0)
    rear_loc = ((OUTER.x - half_x) / 2.0, 0, 0)
    half_dims = Vector((half_x, OUTER.y, OUTER.z))

    front = hollow_box("AGX_SHELL_FRONT", half_dims, front_loc)
    rear = hollow_box("AGX_SHELL_REAR", half_dims, rear_loc)

    # Vents on +Z of both
    for i, x in enumerate((-0.04, 0.0, 0.04)):
        for shell, dx in ((front, front_loc[0]), (rear, rear_loc[0])):
            slot = add_cube(
                f"VENT_{shell.name}_{i}",
                (0.012, 0.04, WALL + 0.004),
                (dx + x, 0, OUTER.z / 2),
            )
            apply_bool(shell, slot)

    # Rear (+X) cable cuts on rear half
    rx = rear_loc[0] + half_x / 2
    apply_bool(rear, add_cube("CUT_RJ45", (WALL + 0.008, 0.016, 0.014), (rx, -0.025, -0.008)))
    apply_bool(rear, add_cube("CUT_QSFP", (WALL + 0.008, 0.022, 0.012), (rx, 0.005, -0.008)))
    apply_bool(rear, add_cube("CUT_DC", (WALL + 0.008, 0.012, 0.012), (rx, 0.032, -0.008)))

    # Front (-X) USB cut + camera boss
    fx = front_loc[0] - half_x / 2
    apply_bool(front, add_cube("CUT_USBC", (WALL + 0.008, 0.028, 0.010), (fx, 0.02, -0.010)))

    boss = add_cyl(
        "CAM_BOSS",
        0.016,
        0.028,
        (fx - 0.008, 0, 0),
        rot=(0, 1.5708, 0),
    )
    apply_bool(front, boss, "UNION")
    bore = add_cyl(
        "CAM_BORE",
        0.009,
        0.04,
        (fx - 0.008, 0, 0),
        rot=(0, 1.5708, 0),
    )
    apply_bool(front, bore)

    print("OUTER_M", tuple(round(x, 5) for x in OUTER))
    for name in ("KIT_DUMMY", "AGX_SHELL_FRONT", "AGX_SHELL_REAR"):
        o = bpy.data.objects[name]
        d = tuple(round(x * 1000, 2) for x in o.dimensions)
        print(name, "dims_mm", d, "loc_mm", tuple(round(c * 1000, 2) for c in o.location))
        print(name, "verts", len(o.data.vertices), "polys", len(o.data.polygons))


build()
